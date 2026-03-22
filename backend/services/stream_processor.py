"""Stream processor for real-time state monitoring with 5-second update cycle."""

from __future__ import annotations

import asyncio
import logging
import threading
import time
from dataclasses import dataclass
from typing import Any, Callable

import numpy as np
import redis
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from services.density_detector import DensityDetector
from services.sensory_detector import SensoryDetector
from services.state_engine import StateEngine, StateResult
from services.video_ingestion import FrameBuffer, VideoIngestion
from services.volatility_detector import VolatilityDetector

logger = logging.getLogger(__name__)


@dataclass
class ProcessingMetrics:
    """Metrics for processing performance."""
    processing_time_ms: float
    queue_depth: int
    frames_processed: int
    ai_model_success: bool
    timestamp: float


class StreamProcessor:
    """Real-time stream processor with 5-second state update cycle."""

    _instances: dict[str, "StreamProcessor"] = {}
    _lock = threading.Lock()

    UPDATE_INTERVAL_SECONDS = 5.0
    HISTORY_WINDOW_SECONDS = 60
    AREA_M2_DEFAULT = 100.0

    def __new__(cls, location_id: str, *args, **kwargs):
        """Singleton per location_id."""
        with cls._lock:
            if location_id not in cls._instances:
                instance = super().__new__(cls)
                cls._instances[location_id] = instance
            return cls._instances[location_id]

    def __init__(
        self,
        location_id: str,
        video_source: str | None = None,
        audio_source: str | None = None,
        area_m2: float = AREA_M2_DEFAULT,
        database_url: str | None = None,
        redis_url: str = "redis://localhost:6379/0",
    ):
        if getattr(self, "_initialized", False):
            return

        self.location_id = location_id
        self.video_source = video_source
        self.audio_source = audio_source
        self.area_m2 = area_m2
        self.database_url = database_url
        self.redis_url = redis_url

        # AI models
        self.density_detector = DensityDetector()
        self.sensory_detector = SensoryDetector()
        self.volatility_detector = VolatilityDetector()
        self.state_engine = StateEngine()

        # Processing state
        self._running = False
        self._thread: threading.Thread | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self._video_ingestion: VideoIngestion | None = None

        # Callbacks for WebSocket broadcasting
        self._update_callbacks: list[Callable[[str, dict], None]] = []

        # Metrics tracking
        self._metrics_history: list[ProcessingMetrics] = []
        self._state_history: list[dict] = []

        # Database connection
        self._engine = None
        self._session_maker = None

        # Redis connection
        self._redis: redis.Redis | None = None

        self._initialized = True

    def _init_connections(self) -> bool:
        """Initialize database and Redis connections."""
        try:
            if self.database_url:
                self._engine = create_engine(self.database_url, pool_pre_ping=True)
                self._session_maker = sessionmaker(bind=self._engine)

            self._redis = redis.from_url(self.redis_url, decode_responses=True)
            self._redis.ping()
            return True
        except Exception as e:
            logger.exception(f"Connection initialization failed: {e}")
            return False

    def add_update_callback(self, callback: Callable[[str, dict], None]) -> None:
        """Add callback for state updates. Callback receives (location_id, state_data)."""
        self._update_callbacks.append(callback)

    def remove_update_callback(self, callback: Callable[[str, dict], None]) -> None:
        """Remove update callback."""
        if callback in self._update_callbacks:
            self._update_callbacks.remove(callback)

    def start_processing(
        self,
        video_source_type: str = "webcam",
        audio_source_type: str = "microphone",
    ) -> bool:
        """Start processing streams for this location.

        Args:
            video_source_type: "rtsp", "file", "webcam", or "upload"
            audio_source_type: "file" or "microphone" (not yet implemented)

        Returns:
            True if started successfully
        """
        if self._running:
            return True

        # Initialize connections
        if not self._init_connections():
            logger.error(f"Failed to initialize connections for {self.location_id}")
            return False

        # Start video ingestion
        if self.video_source:
            from services.video_ingestion import create_ingestion
            self._video_ingestion = create_ingestion(
                source_id=self.location_id,
                source_type=video_source_type,
                source_path=self.video_source,
                fps=2.0,
            )
            if not self._video_ingestion:
                logger.error(f"Failed to start video ingestion for {self.location_id}")
                return False

        self._running = True
        self._thread = threading.Thread(target=self._processing_loop, daemon=True)
        self._thread.start()

        logger.info(f"Started stream processing for location: {self.location_id}")
        return True

    def stop_processing(self) -> None:
        """Stop processing streams."""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=5.0)
        if self._video_ingestion:
            self._video_ingestion.stop()
        logger.info(f"Stopped stream processing for location: {self.location_id}")

    def _processing_loop(self) -> None:
        """Main 5-second processing loop."""
        while self._running:
            start_time = time.perf_counter()

            try:
                # 1. Extract latest frames from video stream
                frames = self._get_latest_frames()

                # 2. Run density detection
                density_result = self._run_density_detection(frames)
                rho = density_result.get("rho", 0.0) if density_result else 0.0

                # 3. Extract and analyze audio (placeholder - would need audio ingestion)
                audio_result = self._run_audio_analysis()
                sigma = audio_result.get("sigma", 0.0) if audio_result else 0.0

                # 4. Fetch historical data (last 60s)
                historical_data = self._fetch_historical_data()

                # 5. Run volatility prediction
                volatility_result = self._run_volatility_analysis(frames, historical_data)
                delta = volatility_result.get("delta", 0.0) if volatility_result else 0.0

                # 6. Calculate state
                state_result = self.state_engine.calculate_state(
                    rho=rho,
                    sigma=sigma,
                    delta=delta,
                    persona="commuter",  # Could be configurable per location
                    location_id=self.location_id,
                )

                # 7. Store in database
                self._store_state(state_result)

                # 8. Broadcast via WebSocket
                state_data = self._prepare_broadcast_data(state_result, density_result, audio_result, volatility_result)
                self._broadcast_update(state_data)

                # Track metrics
                processing_time_ms = (time.perf_counter() - start_time) * 1000
                self._track_metrics(
                    processing_time_ms=processing_time_ms,
                    frames_processed=len(frames),
                    ai_success=all([density_result, volatility_result]),
                )

            except Exception as e:
                logger.exception(f"Processing loop error for {self.location_id}: {e}")
                # Graceful degradation - continue processing
                time.sleep(1.0)

            # Sleep until next cycle
            elapsed = time.perf_counter() - start_time
            sleep_time = max(0, self.UPDATE_INTERVAL_SECONDS - elapsed)
            if sleep_time > 0:
                time.sleep(sleep_time)

    def _get_latest_frames(self) -> list[np.ndarray]:
        """Extract latest frames from video stream."""
        if not self._video_ingestion:
            return []

        # Get batch of frames from queue
        frame_buffers = self._video_ingestion.get_frame_batch(max_frames=10)
        return [fb.frame for fb in frame_buffers]

    def process_frame_batch(self, frames: list[np.ndarray]) -> dict[str, Any]:
        """Process a batch of frames and return aggregated results.

        Returns dict with density, volatility, and combined metrics.
        """
        if not frames:
            return {"error": "No frames provided"}

        results = {
            "frame_count": len(frames),
            "density": None,
            "movement": None,
            "aggregated": {},
        }

        # Run density on middle frame
        middle_frame = frames[len(frames) // 2]
        try:
            density_result = self.density_detector.analyze_frame(middle_frame, self.area_m2)
            results["density"] = density_result
        except Exception as e:
            logger.exception(f"Density detection failed: {e}")

        # Run movement analysis if enough frames
        if len(frames) >= 2:
            try:
                movement_result = self.volatility_detector.analyze_movement(frames)
                results["movement"] = movement_result
            except Exception as e:
                logger.exception(f"Movement analysis failed: {e}")

        return results

    def _run_density_detection(self, frames: list[np.ndarray]) -> dict | None:
        """Run density detection on latest frame."""
        if not frames:
            return None

        try:
            # Use middle frame for density
            middle_frame = frames[len(frames) // 2]
            result = self.density_detector.analyze_frame(middle_frame, self.area_m2)
            return result
        except Exception as e:
            logger.exception(f"Density detection failed: {e}")
            return None

    def _run_audio_analysis(self) -> dict | None:
        """Run sensory analysis on audio.

        Note: Full audio streaming not yet implemented. This is a placeholder
        that would integrate with audio ingestion when available.
        """
        # Placeholder - would extract audio chunk and analyze
        # For now, return neutral values
        return {
            "sigma": 0.3,  # Neutral sensory load
            "db_level": 60.0,
            "distress_detected": False,
        }

    def _fetch_historical_data(self) -> list[dict]:
        """Fetch historical state data from last 60 seconds."""
        try:
            if self._redis:
                # Try Redis first for fast retrieval
                key = f"state_history:{self.location_id}"
                data = self._redis.lrange(key, 0, 11)  # Last 12 entries (60s / 5s)
                if data:
                    import json
                    return [json.loads(d) for d in data]

            # Fallback to database
            if self._engine:
                with self._engine.connect() as conn:
                    query = text("""
                        SELECT rho, sigma, delta, timestamp
                        FROM state_history
                        WHERE location_id = :location_id
                        AND timestamp > NOW() - INTERVAL '60 seconds'
                        ORDER BY timestamp DESC
                        LIMIT 12
                    """)
                    result = conn.execute(query, {"location_id": self.location_id})
                    return [
                        {"rho": row[0], "sigma": row[1], "delta": row[2], "timestamp": row[3]}
                        for row in result
                    ]
        except Exception as e:
            logger.exception(f"Failed to fetch historical data: {e}")

        # Return empty if all fails
        return []

    def _run_volatility_analysis(
        self, frames: list[np.ndarray], historical_data: list[dict]
    ) -> dict | None:
        """Run volatility prediction."""
        try:
            # Analyze movement
            movement_result = self.volatility_detector.analyze_movement(frames)

            # Calculate volatility
            variance = movement_result.get("movement_variance", 0.0)
            trend = "stable"

            # Predict volatility if we have enough history
            if len(historical_data) >= 10:
                try:
                    prediction = self.volatility_detector.predict_volatility(historical_data)
                    trend = prediction.get("trend", "stable")
                    predicted_delta = prediction.get("predicted_delta_2m", variance)
                except Exception:
                    predicted_delta = variance
            else:
                predicted_delta = variance

            delta = self.volatility_detector.calculate_delta(variance, trend)

            return {
                "delta": delta,
                "variance": variance,
                "trend": trend,
                "predicted_delta_2m": predicted_delta,
                "movement": movement_result,
            }
        except Exception as e:
            logger.exception(f"Volatility analysis failed: {e}")
            return None

    def _store_state(self, state_result: StateResult) -> None:
        """Store state in database and Redis."""
        try:
            # Store in Redis for fast access
            if self._redis:
                import json
                state_data = {
                    "location_id": self.location_id,
                    "rho": state_result.raw_scores.get("rho", 0),
                    "sigma": state_result.raw_scores.get("sigma", 0),
                    "delta": state_result.raw_scores.get("delta", 0),
                    "state_score": state_result.state_score,
                    "status": state_result.status.value,
                    "message": state_result.message,
                    "timestamp": state_result.timestamp,
                }
                # Add to list, trim to last 12 entries
                self._redis.lpush(f"state_history:{self.location_id}", json.dumps(state_data))
                self._redis.ltrim(f"state_history:{self.location_id}", 0, 11)
                # Set current state
                self._redis.setex(
                    f"current_state:{self.location_id}",
                    30,  # Expire after 30s
                    json.dumps(state_data),
                )

            # Store in TimescaleDB
            if self._session_maker:
                # Note: Would need proper model/alembic migration
                # This is a placeholder for the actual DB storage
                pass

        except Exception as e:
            logger.exception(f"Failed to store state: {e}")

    def _prepare_broadcast_data(
        self,
        state_result: StateResult,
        density_result: dict | None,
        audio_result: dict | None,
        volatility_result: dict | None,
    ) -> dict:
        """Prepare data for WebSocket broadcast."""
        return {
            "type": "state_update",
            "location_id": self.location_id,
            "timestamp": state_result.timestamp,
            "state": {
                "rho": round(state_result.raw_scores.get("rho", 0), 4),
                "sigma": round(state_result.raw_scores.get("sigma", 0), 4),
                "delta": round(state_result.raw_scores.get("delta", 0), 4),
                "state_score": round(state_result.state_score, 2),
                "status": state_result.status.value,
                "message": state_result.message,
            },
            "alerts": [
                {
                    "type": a.type,
                    "message": a.message,
                    "priority": a.priority.value,
                }
                for a in state_result.alerts
            ],
            "recommendations": state_result.recommendations,
            "telemetry": state_result.telemetry,
            "details": {
                "density": density_result,
                "sensory": audio_result,
                "volatility": volatility_result,
            },
        }

    def _broadcast_update(self, state_data: dict) -> None:
        """Broadcast state update to all callbacks."""
        for callback in self._update_callbacks:
            try:
                callback(self.location_id, state_data)
            except Exception:
                logger.exception("Broadcast callback error")

    def _track_metrics(
        self,
        processing_time_ms: float,
        frames_processed: int,
        ai_success: bool,
    ) -> None:
        """Track processing metrics."""
        metrics = ProcessingMetrics(
            processing_time_ms=processing_time_ms,
            queue_depth=self._video_ingestion._frame_queue.qsize() if self._video_ingestion else 0,
            frames_processed=frames_processed,
            ai_model_success=ai_success,
            timestamp=time.time(),
        )
        self._metrics_history.append(metrics)

        # Keep only last 100 metrics
        if len(self._metrics_history) > 100:
            self._metrics_history.pop(0)

    def aggregate_results(self) -> dict:
        """Aggregate recent processing results and metrics.

        Returns summary statistics for monitoring.
        """
        if not self._metrics_history:
            return {"error": "No metrics available"}

        recent = self._metrics_history[-20:]  # Last 20 cycles (100s)

        return {
            "location_id": self.location_id,
            "running": self._running,
            "metrics": {
                "avg_processing_time_ms": round(
                    sum(m.processing_time_ms for m in recent) / len(recent), 2
                ),
                "max_processing_time_ms": round(
                    max(m.processing_time_ms for m in recent), 2
                ),
                "avg_queue_depth": round(
                    sum(m.queue_depth for m in recent) / len(recent), 1
                ),
                "ai_success_rate": round(
                    sum(1 for m in recent if m.ai_model_success) / len(recent), 2
                ),
            },
            "state_history_count": len(self._state_history),
            "update_interval_seconds": self.UPDATE_INTERVAL_SECONDS,
        }

    def update_state_vector(self) -> dict:
        """Manually trigger a state update and return current vector.

        Returns the current state vector (ρ, Σ, Δ, score, status).
        """
        # Trigger one processing cycle
        frames = self._get_latest_frames()

        density_result = self._run_density_detection(frames)
        rho = density_result.get("rho", 0.0) if density_result else 0.0

        audio_result = self._run_audio_analysis()
        sigma = audio_result.get("sigma", 0.0) if audio_result else 0.0

        historical_data = self._fetch_historical_data()
        volatility_result = self._run_volatility_analysis(frames, historical_data)
        delta = volatility_result.get("delta", 0.0) if volatility_result else 0.0

        state_result = self.state_engine.calculate_state(
            rho=rho, sigma=sigma, delta=delta,
            persona="commuter", location_id=self.location_id,
        )

        return {
            "rho": rho,
            "sigma": sigma,
            "delta": delta,
            "state_score": state_result.state_score,
            "status": state_result.status.value,
            "message": state_result.message,
            "timestamp": time.time(),
        }

    @classmethod
    def get_instance(cls, location_id: str) -> "StreamProcessor | None":
        """Get existing instance by location_id."""
        return cls._instances.get(location_id)

    @classmethod
    def get_all_instances(cls) -> dict[str, "StreamProcessor"]:
        """Get all active instances."""
        return cls._instances.copy()

    @classmethod
    def stop_all(cls) -> None:
        """Stop all stream processors."""
        for processor in list(cls._instances.values()):
            processor.stop_processing()
        cls._instances.clear()


# Factory function
def create_processor(
    location_id: str,
    video_source: str | None = None,
    audio_source: str | None = None,
    database_url: str | None = None,
    redis_url: str = "redis://localhost:6379/0",
) -> StreamProcessor | None:
    """Create and start a stream processor.

    Returns:
        StreamProcessor instance or None if failed
    """
    processor = StreamProcessor(
        location_id=location_id,
        video_source=video_source,
        audio_source=audio_source,
        database_url=database_url,
        redis_url=redis_url,
    )
    if processor.start_processing():
        return processor
    return None
