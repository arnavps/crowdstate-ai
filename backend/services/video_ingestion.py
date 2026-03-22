"""Video ingestion service supporting RTSP, local files, uploaded videos, and webcam."""

from __future__ import annotations

import logging
import queue
import threading
import time
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Callable

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class VideoSource(Enum):
    """Video source types."""
    RTSP = "rtsp"
    FILE = "file"
    WEBCAM = "webcam"
    UPLOAD = "upload"


@dataclass
class FrameBuffer:
    """Frame buffer with metadata."""
    frame: np.ndarray
    timestamp: float
    source_id: str


class VideoIngestion:
    """Video ingestion service with frame extraction at 2 FPS."""

    _instances: dict[str, "VideoIngestion"] = {}
    _lock = threading.Lock()

    def __new__(cls, source_id: str, *args, **kwargs):
        """Singleton per source_id."""
        with cls._lock:
            if source_id not in cls._instances:
                instance = super().__new__(cls)
                cls._instances[source_id] = instance
            return cls._instances[source_id]

    def __init__(
        self,
        source_id: str,
        source_type: VideoSource | str,
        source_path: str,
        fps: float = 2.0,
        buffer_size: int = 100,
    ):
        if getattr(self, "_initialized", False):
            return

        self.source_id = source_id
        self.source_type = VideoSource(source_type) if isinstance(source_type, str) else source_type
        self.source_path = source_path
        self.target_fps = fps
        self.frame_interval = 1.0 / fps
        self.buffer_size = buffer_size

        self._capture: cv2.VideoCapture | None = None
        self._frame_queue: queue.Queue[FrameBuffer] = queue.Queue(maxsize=buffer_size)
        self._running = False
        self._thread: threading.Thread | None = None
        self._last_frame_time = 0.0
        self._frame_count = 0
        self._error_count = 0
        self._lock = threading.Lock()
        self._callbacks: list[Callable[[FrameBuffer], None]] = []

        self._initialized = True

    def add_callback(self, callback: Callable[[FrameBuffer], None]) -> None:
        """Add callback to be called on each frame."""
        with self._lock:
            self._callbacks.append(callback)

    def remove_callback(self, callback: Callable[[FrameBuffer], None]) -> None:
        """Remove a callback."""
        with self._lock:
            if callback in self._callbacks:
                self._callbacks.remove(callback)

    def _initialize_capture(self) -> bool:
        """Initialize video capture based on source type."""
        try:
            if self.source_type == VideoSource.WEBCAM:
                # Webcam index (0 for default)
                webcam_idx = int(self.source_path) if self.source_path.isdigit() else 0
                self._capture = cv2.VideoCapture(webcam_idx)
                # Set webcam properties for better quality
                self._capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                self._capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            elif self.source_type == VideoSource.RTSP:
                # RTSP stream with buffer settings
                self._capture = cv2.VideoCapture(self.source_path)
                self._capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            else:
                # Local file or upload
                path = Path(self.source_path)
                if not path.exists():
                    logger.error(f"Video file not found: {self.source_path}")
                    return False
                self._capture = cv2.VideoCapture(str(path))

            if not self._capture.isOpened():
                logger.error(f"Failed to open video source: {self.source_path}")
                return False

            logger.info(f"Video capture initialized: {self.source_type.value} - {self.source_path}")
            return True

        except Exception as e:
            logger.exception(f"Failed to initialize video capture: {e}")
            return False

    def _capture_loop(self) -> None:
        """Main capture loop running at target FPS."""
        while self._running:
            try:
                if self._capture is None or not self._capture.isOpened():
                    if not self._initialize_capture():
                        time.sleep(1.0)
                        continue

                # Control frame rate
                current_time = time.time()
                elapsed = current_time - self._last_frame_time

                if elapsed < self.frame_interval:
                    time.sleep(self.frame_interval - elapsed)
                    continue

                ret, frame = self._capture.read()

                if not ret:
                    # End of file or stream disconnected
                    if self.source_type in (VideoSource.FILE, VideoSource.UPLOAD):
                        # Loop file
                        self._capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        continue
                    else:
                        # RTSP/Webcam - try to reconnect
                        logger.warning(f"Stream disconnected, attempting reconnect: {self.source_id}")
                        self._capture.release()
                        self._capture = None
                        time.sleep(2.0)
                        continue

                self._last_frame_time = time.time()
                self._frame_count += 1

                # Create frame buffer
                frame_buffer = FrameBuffer(
                    frame=frame.copy(),
                    timestamp=self._last_frame_time,
                    source_id=self.source_id,
                )

                # Add to queue (drop oldest if full)
                try:
                    self._frame_queue.put_nowait(frame_buffer)
                except queue.Full:
                    try:
                        self._frame_queue.get_nowait()
                        self._frame_queue.put_nowait(frame_buffer)
                    except queue.Empty:
                        pass

                # Notify callbacks
                with self._lock:
                    for callback in self._callbacks:
                        try:
                            callback(frame_buffer)
                        except Exception:
                            logger.exception("Frame callback error")

            except Exception as e:
                self._error_count += 1
                logger.exception(f"Capture loop error: {e}")
                if self._error_count > 10:
                    logger.error("Too many errors, stopping capture")
                    break
                time.sleep(0.5)

    def start(self) -> bool:
        """Start video ingestion."""
        if self._running:
            return True

        if not self._initialize_capture():
            return False

        self._running = True
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()
        logger.info(f"Started video ingestion: {self.source_id}")
        return True

    def stop(self) -> None:
        """Stop video ingestion."""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        if self._capture:
            self._capture.release()
            self._capture = None
        logger.info(f"Stopped video ingestion: {self.source_id}")

    def get_latest_frame(self) -> FrameBuffer | None:
        """Get the latest frame without removing from queue."""
        try:
            # Peek at latest without removing
            frames = list(self._frame_queue.queue)
            return frames[-1] if frames else None
        except Exception:
            return None

    def get_frame_batch(self, max_frames: int = 10) -> list[FrameBuffer]:
        """Get a batch of frames from queue."""
        frames = []
        try:
            for _ in range(min(max_frames, self._frame_queue.qsize())):
                frames.append(self._frame_queue.get_nowait())
        except queue.Empty:
            pass
        return frames

    def get_stats(self) -> dict:
        """Get ingestion statistics."""
        return {
            "source_id": self.source_id,
            "source_type": self.source_type.value,
            "running": self._running,
            "frame_count": self._frame_count,
            "error_count": self._error_count,
            "queue_size": self._frame_queue.qsize(),
            "fps": self.target_fps,
        }

    @classmethod
    def get_instance(cls, source_id: str) -> "VideoIngestion | None":
        """Get existing instance by source_id."""
        return cls._instances.get(source_id)

    @classmethod
    def stop_all(cls) -> None:
        """Stop all ingestion instances."""
        for instance in list(cls._instances.values()):
            instance.stop()
        cls._instances.clear()

    @classmethod
    def list_active(cls) -> list[str]:
        """List all active source IDs."""
        return list(cls._instances.keys())


def create_ingestion(
    source_id: str,
    source_type: str,
    source_path: str,
    fps: float = 2.0,
) -> VideoIngestion | None:
    """Factory function to create and start video ingestion.

    Args:
        source_id: Unique identifier for this source
        source_type: "rtsp", "file", "webcam", or "upload"
        source_path: Path or URL to the source
        fps: Target frames per second (default 2.0)

    Returns:
        VideoIngestion instance or None if failed
    """
    try:
        ingestion = VideoIngestion(
            source_id=source_id,
            source_type=source_type,
            source_path=source_path,
            fps=fps,
        )
        if ingestion.start():
            return ingestion
        return None
    except Exception as e:
        logger.exception(f"Failed to create ingestion: {e}")
        return None
