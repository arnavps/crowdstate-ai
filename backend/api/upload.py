"""Video upload API endpoints."""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from workers.video_processor import process_video
from services.connection_manager import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["upload"])

# Upload configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
SUPPORTED_FORMATS = {'.mp4', '.avi', '.mov', '.mkv'}
MAX_DURATION_MINUTES = 5

# Store task status in memory (use Redis in production)
task_store: dict[str, dict[str, Any]] = {}


@router.post("/api/upload/video")
async def upload_video(
    video: UploadFile = File(...),
    location_id: str = Form(...),
) -> JSONResponse:
    """
    Upload a video file for processing.
    
    - Saves file to uploads directory
    - Queues Celery task for processing
    - Returns task ID for tracking
    """
    # Validate file
    if not video.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file extension
    file_ext = Path(video.filename).suffix.lower()
    if file_ext not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format: {file_ext}. Supported: {', '.join(SUPPORTED_FORMATS)}"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"
    
    try:
        # Save uploaded file
        content = await video.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Write file
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"[Upload] Saved file: {file_path} ({len(content)} bytes)")
        
        # Create task record
        task_id = str(uuid.uuid4())
        task_store[task_id] = {
            "task_id": task_id,
            "status": "queued",
            "progress": 0,
            "step": "Queued for processing",
            "file_path": str(file_path),
            "location_id": location_id,
            "filename": video.filename,
            "error": None,
        }
        
        # Queue Celery task
        process_video.delay(task_id, str(file_path), location_id)
        
        logger.info(f"[Upload] Queued task {task_id} for location {location_id}")
        
        return JSONResponse({
            "task_id": task_id,
            "status": "queued",
            "message": "Video uploaded successfully. Processing has begun.",
        })
        
    except HTTPException:
        # Clean up file if validation failed
        if file_path.exists():
            file_path.unlink()
        raise
    except Exception as e:
        logger.exception(f"[Upload] Failed to process upload: {e}")
        # Clean up file
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process upload"
        )


@router.get("/api/tasks/{task_id}/status")
async def get_task_status(task_id: str) -> JSONResponse:
    """Get the status of a processing task."""
    if task_id not in task_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return JSONResponse(task_store[task_id])


@router.get("/api/tasks")
async def list_tasks(location_id: str | None = None) -> JSONResponse:
    """List all tasks, optionally filtered by location."""
    tasks = list(task_store.values())
    
    if location_id:
        tasks = [t for t in tasks if t["location_id"] == location_id]
    
    return JSONResponse({
        "tasks": tasks,
        "count": len(tasks),
    })


def update_task_status(
    task_id: str,
    status: str,
    progress: int | None = None,
    step: str | None = None,
    error: str | None = None,
) -> None:
    """Update task status (called by worker)."""
    if task_id not in task_store:
        return
    
    task_store[task_id]["status"] = status
    
    if progress is not None:
        task_store[task_id]["progress"] = progress
    if step is not None:
        task_store[task_id]["step"] = step
    if error is not None:
        task_store[task_id]["error"] = error
    
    # Broadcast update via WebSocket
    location_id = task_store[task_id]["location_id"]
    asyncio = __import__("asyncio")
    asyncio.create_task(
        connection_manager.broadcast_to_location(
            location_id,
            {
                "type": "task_update",
                "task_id": task_id,
                "status": status,
                "progress": progress,
                "step": step,
            }
        )
    )
