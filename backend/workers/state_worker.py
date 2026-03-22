"""Background worker for state processing using Celery."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta
from typing import Any

from celery import Celery
from celery.schedules import crontab
from sqlalchemy import create_engine, text

from services.stream_processor import StreamProcessor, create_processor

logger = logging.getLogger(__name__)

# Celery configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://crowdstate:crowdstate@postgres:5432/crowdstate",
)

celery_app = Celery(
    "state_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["workers.state_worker"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    worker_prefetch_multiplier=1,
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "update-active-locations": {
        "task": "workers.state_worker.update_all_active_locations",
        "schedule": 5.0,  # Every 5 seconds
    },
    "cleanup-old-data": {
        "task": "workers.state_worker.cleanup_old_data",
        "schedule": crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}


@celery_app.task(bind=True, max_retries=3)
def process_location_state(self, location_id: str, video_source: str | None = None) -> dict:
    """Process state for a specific location.

    Args:
        location_id: Unique location identifier
        video_source: Optional video source path/URL

    Returns:
        Processing result with state data
    """
    try:
        logger.info(f"Processing state for location: {location_id}")

        # Get or create processor
        processor = StreamProcessor.get_instance(location_id)

        if not processor:
            if not video_source:
                return {
                    "success": False,
                    "error": "No processor exists and no video_source provided",
                    "location_id": location_id,
                }

            # Create new processor
            processor = create_processor(
                location_id=location_id,
                video_source=video_source,
                database_url=DATABASE_URL,
                redis_url=REDIS_URL,
            )

            if not processor:
                return {
                    "success": False,
                    "error": "Failed to create processor",
                    "location_id": location_id,
                }

        # Trigger state update
        state = processor.update_state_vector()

        return {
            "success": True,
            "location_id": location_id,
            "state": state,
            "metrics": processor.aggregate_results(),
        }

    except Exception as exc:
        logger.exception(f"State processing failed for {location_id}: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@celery_app.task(bind=True, max_retries=2)
def process_video_upload(self, file_path: str, location_id: str, area_m2: float = 100.0) -> dict:
    """Process uploaded video file and extract state data.

    Args:
        file_path: Path to uploaded video file
        location_id: Location identifier for context
        area_m2: Area in square meters for density calculation

    Returns:
        Processing result with extracted states
    """
    try:
        from services.density_detector import DensityDetector
        from services.volatility_detector import VolatilityDetector

        logger.info(f"Processing video upload: {file_path} for location: {location_id}")

        detector = DensityDetector()
        vol_detector = VolatilityDetector()

        import cv2
        import numpy as np

        capture = cv2.VideoCapture(file_path)
        if not capture.isOpened():
            return {
                "success": False,
                "error": f"Cannot open video: {file_path}",
            }

        results = []
        frames = []
        frame_count = 0

        # Process every 30 frames (at 30fps = every 1 second)
        sample_interval = 30

        while True:
            ret, frame = capture.read()
            if not ret:
                break

            frame_count += 1

            if frame_count % sample_interval == 0:
                try:
                    # Density analysis
                    density_result = detector.analyze_frame(frame, area_m2)

                    # Movement analysis (need multiple frames)
                    frames.append(frame)
                    if len(frames) > 10:
                        frames.pop(0)

                    volatility_result = None
                    if len(frames) >= 2:
                        volatility_result = vol_detector.analyze_movement(frames)

                    results.append({
                        "frame": frame_count,
                        "timestamp": frame_count / 30.0,  # Approximate timestamp
                        "rho": density_result.get("rho", 0),
                        "count": density_result.get("count", 0),
                        "movement": volatility_result.get("movement_type", "unknown") if volatility_result else "unknown",
                    })

                except Exception as e:
                    logger.exception(f"Frame processing error at frame {frame_count}: {e}")

        capture.release()

        # Clean up uploaded file
        try:
            os.remove(file_path)
        except Exception:
            pass

        return {
            "success": True,
            "location_id": location_id,
            "total_frames": frame_count,
            "processed_samples": len(results),
            "results": results,
        }

    except Exception as exc:
        logger.exception(f"Video processing failed: {exc}")
        raise self.retry(exc=exc, countdown=30)


@celery_app.task
def generate_historical_report(location_id: str, time_range_hours: int = 24) -> dict:
    """Generate historical state report for a location.

    Args:
        location_id: Location identifier
        time_range_hours: Time range in hours (default 24)

    Returns:
        Report with aggregated statistics
    """
    try:
        engine = create_engine(DATABASE_URL)

        with engine.connect() as conn:
            # Query historical data
            query = text("""
                SELECT
                    rho, sigma, delta, state_score, status, timestamp
                FROM state_history
                WHERE location_id = :location_id
                AND timestamp > NOW() - INTERVAL ':hours hours'
                ORDER BY timestamp ASC
            """)

            result = conn.execute(query, {
                "location_id": location_id,
                "hours": time_range_hours,
            })

            rows = list(result)

            if not rows:
                return {
                    "success": True,
                    "location_id": location_id,
                    "time_range_hours": time_range_hours,
                    "message": "No data available for time range",
                    "statistics": {},
                }

            # Calculate statistics
            import numpy as np

            rhos = [row[0] for row in rows]
            sigmas = [row[1] for row in rows]
            deltas = [row[2] for row in rows]
            scores = [row[3] for row in rows]

            # Status distribution
            status_counts = {}
            for row in rows:
                status = row[4]
                status_counts[status] = status_counts.get(status, 0) + 1

            report = {
                "success": True,
                "location_id": location_id,
                "time_range_hours": time_range_hours,
                "total_readings": len(rows),
                "period": {
                    "start": rows[0][5].isoformat() if hasattr(rows[0][5], 'isoformat') else str(rows[0][5]),
                    "end": rows[-1][5].isoformat() if hasattr(rows[-1][5], 'isoformat') else str(rows[-1][5]),
                },
                "statistics": {
                    "rho": {
                        "avg": round(float(np.mean(rhos)), 4),
                        "min": round(float(np.min(rhos)), 4),
                        "max": round(float(np.max(rhos)), 4),
                    },
                    "sigma": {
                        "avg": round(float(np.mean(sigmas)), 4),
                        "min": round(float(np.min(sigmas)), 4),
                        "max": round(float(np.max(sigmas)), 4),
                    },
                    "delta": {
                        "avg": round(float(np.mean(deltas)), 4),
                        "min": round(float(np.min(deltas)), 4),
                        "max": round(float(np.max(deltas)), 4),
                    },
                    "state_score": {
                        "avg": round(float(np.mean(scores)), 2),
                        "min": round(float(np.min(scores)), 2),
                        "max": round(float(np.max(scores)), 2),
                    },
                },
                "status_distribution": status_counts,
            }

            return report

    except Exception as exc:
        logger.exception(f"Report generation failed: {exc}")
        return {
            "success": False,
            "error": str(exc),
            "location_id": location_id,
        }


@celery_app.task
def update_all_active_locations() -> dict:
    """Periodic task: Update all locations with active streams.

    Called every 5 seconds to ensure all active locations are being processed.
    """
    try:
        # Get all active processors
        processors = StreamProcessor.get_all_instances()

        results = []
        for location_id, processor in processors.items():
            if processor._running:
                # Trigger update (processor runs its own loop, this ensures freshness)
                state = processor.update_state_vector()
                metrics = processor.aggregate_results()
                results.append({
                    "location_id": location_id,
                    "state": state,
                    "metrics": metrics,
                })

        return {
            "success": True,
            "locations_updated": len(results),
            "results": results,
        }

    except Exception as exc:
        logger.exception(f"Active locations update failed: {exc}")
        return {
            "success": False,
            "error": str(exc),
        }


@celery_app.task
def cleanup_old_data() -> dict:
    """Periodic task: Clean up state history older than 7 days.

    Called daily at 2 AM.
    """
    try:
        engine = create_engine(DATABASE_URL)

        with engine.connect() as conn:
            # Delete old records
            delete_query = text("""
                DELETE FROM state_history
                WHERE timestamp < NOW() - INTERVAL '7 days'
            """)
            result = conn.execute(delete_query)
            conn.commit()

            deleted_count = result.rowcount if hasattr(result, 'rowcount') else 0

            logger.info(f"Cleaned up {deleted_count} old state history records")

            return {
                "success": True,
                "deleted_records": deleted_count,
                "retention_days": 7,
            }

    except Exception as exc:
        logger.exception(f"Data cleanup failed: {exc}")
        return {
            "success": False,
            "error": str(exc),
        }


@celery_app.task
def start_location_stream(
    location_id: str,
    video_source: str,
    source_type: str = "webcam",
    area_m2: float = 100.0,
) -> dict:
    """Start a new stream processor for a location.

    Args:
        location_id: Unique location identifier
        video_source: Video source path/URL
        source_type: Source type (rtsp, file, webcam, upload)
        area_m2: Area for density calculation

    Returns:
        Result of stream startup
    """
    try:
        # Check if already running
        existing = StreamProcessor.get_instance(location_id)
        if existing and existing._running:
            return {
                "success": True,
                "location_id": location_id,
                "message": "Stream already running",
                "status": "active",
            }

        # Create and start processor
        processor = create_processor(
            location_id=location_id,
            video_source=video_source,
            database_url=DATABASE_URL,
            redis_url=REDIS_URL,
        )

        if processor:
            return {
                "success": True,
                "location_id": location_id,
                "message": "Stream started successfully",
                "status": "active",
            }
        else:
            return {
                "success": False,
                "location_id": location_id,
                "error": "Failed to start stream processor",
            }

    except Exception as exc:
        logger.exception(f"Failed to start stream: {exc}")
        return {
            "success": False,
            "location_id": location_id,
            "error": str(exc),
        }


@celery_app.task
def stop_location_stream(location_id: str) -> dict:
    """Stop stream processor for a location.

    Args:
        location_id: Location identifier

    Returns:
        Result of stream stop
    """
    try:
        processor = StreamProcessor.get_instance(location_id)
        if not processor:
            return {
                "success": True,
                "location_id": location_id,
                "message": "No active stream found",
            }

        processor.stop_processing()

        return {
            "success": True,
            "location_id": location_id,
            "message": "Stream stopped successfully",
        }

    except Exception as exc:
        logger.exception(f"Failed to stop stream: {exc}")
        return {
            "success": False,
            "location_id": location_id,
            "error": str(exc),
        }
