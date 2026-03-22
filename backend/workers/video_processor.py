"""Video processing Celery worker."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from celery import Celery
from celery.exceptions import SoftTimeLimitExceeded

# Import services
from services.density_detector import DensityDetector
from services.sensory_detector import SensoryDetector
from services.volatility_detector import VolatilityDetector
from services.state_engine import StateEngine
from api.upload import update_task_status

logger = logging.getLogger(__name__)

# Celery app
app = Celery('video_processor')
app.config_from_object({
    'broker_url': os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    'result_backend': os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    'task_serializer': 'json',
    'accept_content': ['json'],
    'result_serializer': 'json',
    'timezone': 'UTC',
    'enable_utc': True,
    'task_track_started': True,
    'task_time_limit': 600,  # 10 minutes hard limit
    'task_soft_time_limit': 540,  # 9 minutes soft limit
})

# Initialize detectors
density_detector = DensityDetector()
sensory_detector = SensoryDetector()
volatility_detector = VolatilityDetector()
state_engine = StateEngine()

# Target FPS for processing (analyze every Nth frame)
TARGET_FPS = 2
MAX_FRAMES = 600  # Max 5 minutes at 2 FPS


@app.task(bind=True, max_retries=3)
def process_video(self, task_id: str, file_path: str, location_id: str) -> dict[str, Any]:
    """
    Process a video file through the AI pipeline.
    
    Steps:
    1. Extract frames from video
    2. Run YOLO detection on each frame
    3. Analyze audio (if present)
    4. Calculate volatility metrics
    5. Fuse state via StateEngine
    6. Broadcast results
    7. Cleanup
    
    Args:
        task_id: Unique task identifier
        file_path: Path to uploaded video file
        location_id: Location being monitored
    
    Returns:
        Processing results including state metrics
    """
    logger.info(f"[VideoProcessor] Starting task {task_id} for {file_path}")
    
    try:
        # Update status
        update_task_status(
            task_id=task_id,
            status="processing",
            progress=5,
            step="Extracting frames..."
        )
        
        # Open video
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            raise ValueError(f"Failed to open video: {file_path}")
        
        # Get video properties
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = max(1, int(fps / TARGET_FPS))
        
        logger.info(f"[VideoProcessor] Video: {total_frames} frames, {fps} FPS, interval: {frame_interval}")
        
        # Process frames
        frame_count = 0
        processed_frames = 0
        density_values = []
        volatility_values = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every Nth frame
            if frame_count % frame_interval == 0:
                # Update progress every 10 frames
                if processed_frames % 10 == 0:
                    progress = min(95, 10 + int((processed_frames / min(total_frames // frame_interval, MAX_FRAMES)) * 80))
                    update_task_status(
                        task_id=task_id,
                        status="processing",
                        progress=progress,
                        step=f"Processing frames... {processed_frames}/{min(total_frames // frame_interval, MAX_FRAMES)}"
                    )
                
                # Run detection
                try:
                    # Density detection (YOLO)
                    density_result = density_detector.analyze_frame(frame)
                    rho = density_result.get('density', 0.0)
                    density_values.append(rho)
                    
                    # Volatility detection (optical flow)
                    volatility_result = volatility_detector.analyze_frame(frame)
                    delta = volatility_result.get('volatility', 0.0)
                    volatility_values.append(delta)
                    
                    processed_frames += 1
                    
                    # Limit max frames
                    if processed_frames >= MAX_FRAMES:
                        logger.info(f"[VideoProcessor] Reached max frames limit ({MAX_FRAMES})")
                        break
                        
                except Exception as e:
                    logger.error(f"[VideoProcessor] Frame processing error: {e}")
                    continue
            
            frame_count += 1
        
        cap.release()
        
        # Update status
        update_task_status(
            task_id=task_id,
            status="processing",
            progress=90,
            step="Running AI models..."
        )
        
        # Calculate aggregated metrics
        avg_rho = sum(density_values) / len(density_values) if density_values else 0.0
        avg_delta = sum(volatility_values) / len(volatility_values) if volatility_values else 0.0
        
        # Placeholder for audio analysis (would need audio extraction)
        sigma = 0.0  # No audio in this version
        
        # Calculate state
        state_result = state_engine.calculate_state(
            rho=avg_rho,
            sigma=sigma,
            delta=avg_delta,
            persona="station_manager"  # Default persona
        )
        
        # Update status
        update_task_status(
            task_id=task_id,
            status="complete",
            progress=100,
            step="Complete!"
        )
        
        # Broadcast final state
        from api.websocket import connection_manager
        import asyncio
        
        asyncio.run(
            connection_manager.broadcast_to_location(
                location_id,
                {
                    "type": "state_update",
                    "location_id": location_id,
                    "timestamp": state_result.timestamp,
                    "data": {
                        "rho": state_result.rho,
                        "sigma": state_result.sigma,
                        "delta": state_result.delta,
                        "state_score": state_result.state_score,
                        "status": state_result.status.value,
                        "message": state_result.message,
                        "alerts": [
                            {"type": a.type, "message": a.message, "priority": a.priority.value}
                            for a in state_result.alerts
                        ],
                        "recommendations": state_result.recommendations,
                    }
                }
            )
        )
        
        # Cleanup
        cleanup_file(file_path)
        
        result = {
            "task_id": task_id,
            "status": "complete",
            "frames_processed": processed_frames,
            "metrics": {
                "rho": avg_rho,
                "sigma": sigma,
                "delta": avg_delta,
                "state_score": state_result.state_score,
                "status": state_result.status.value,
            },
            "alerts": len(state_result.alerts),
        }
        
        logger.info(f"[VideoProcessor] Task {task_id} completed successfully")
        return result
        
    except SoftTimeLimitExceeded:
        logger.error(f"[VideoProcessor] Task {task_id} exceeded time limit")
        update_task_status(
            task_id=task_id,
            status="error",
            error="Processing timeout - video may be too long"
        )
        cleanup_file(file_path)
        raise
        
    except Exception as e:
        logger.exception(f"[VideoProcessor] Task {task_id} failed: {e}")
        update_task_status(
            task_id=task_id,
            status="error",
            error=str(e)
        )
        cleanup_file(file_path)
        
        # Retry logic
        if self.request.retries < 3:
            logger.info(f"[VideoProcessor] Retrying task {task_id} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=5)
        
        raise


def cleanup_file(file_path: str) -> None:
    """Remove processed file to save space."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"[VideoProcessor] Cleaned up file: {file_path}")
    except Exception as e:
        logger.error(f"[VideoProcessor] Failed to cleanup file: {e}")
