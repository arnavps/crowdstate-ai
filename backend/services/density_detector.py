from __future__ import annotations

import logging
import threading
import time
from pathlib import Path
from typing import Callable

import cv2
import numpy as np
from ultralytics import YOLO

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[int, int, float], None]


class DensityDetector:
    """YOLOv8-based person density detector with singleton model cache."""

    _instance: "DensityDetector | None" = None
    _model: YOLO | None = None
    _model_lock = threading.Lock()
    _instance_lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_path: str = "yolov8n.pt", confidence_threshold: float = 0.5):
        if getattr(self, "_initialized", False):
            return

        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self._ensure_model()
        self._initialized = True

    def _ensure_model(self) -> None:
        if DensityDetector._model is not None:
            return

        with DensityDetector._model_lock:
            if DensityDetector._model is not None:
                return
            try:
                model_file = Path(self.model_path)
                logger.info("Loading YOLO model from %s", model_file)
                # Ultralytics downloads yolov8n.pt automatically when missing.
                DensityDetector._model = YOLO(str(model_file))
                logger.info("YOLO model ready")
            except Exception:
                logger.exception("Failed to load YOLO model")
                raise

    @property
    def model(self) -> YOLO:
        if DensityDetector._model is None:
            self._ensure_model()
        assert DensityDetector._model is not None
        return DensityDetector._model

    @staticmethod
    def calculate_rho(person_count: int, area_m2: float) -> float:
        """Return normalized crowd density (0..1) from count and area."""
        if area_m2 <= 0:
            raise ValueError("area_m2 must be greater than zero")
        if person_count < 0:
            raise ValueError("person_count cannot be negative")

        # 4 persons/m² is treated as saturation for normalization.
        rho = person_count / (area_m2 * 4.0)
        return max(0.0, min(1.0, float(rho)))

    def analyze_frame(self, image: np.ndarray, area_m2: float) -> dict:
        if image is None or image.size == 0:
            raise ValueError("Empty image provided")
        if area_m2 <= 0:
            raise ValueError("area_m2 must be greater than zero")

        started = time.perf_counter()
        try:
            results = self.model.predict(image, verbose=False)
            person_count = 0
            for result in results:
                boxes = getattr(result, "boxes", None)
                if boxes is None:
                    continue
                for box in boxes:
                    cls_id = int(box.cls.item()) if hasattr(box.cls, "item") else int(box.cls)
                    conf = float(box.conf.item()) if hasattr(box.conf, "item") else float(box.conf)
                    if cls_id == 0 and conf > self.confidence_threshold:
                        person_count += 1

            rho = self.calculate_rho(person_count=person_count, area_m2=area_m2)
            inference_ms = (time.perf_counter() - started) * 1000
            logger.info(
                "Frame analyzed: people=%s rho=%.3f area=%.2f time=%.2fms",
                person_count,
                rho,
                area_m2,
                inference_ms,
            )
            return {
                "rho": rho,
                "count": person_count,
                "area_m2": area_m2,
                "inference_time_ms": round(inference_ms, 2),
            }
        except Exception:
            logger.exception("Frame analysis failed")
            raise

    def analyze_video(
        self,
        video_path: str,
        area_m2: float,
        progress_callback: ProgressCallback | None = None,
    ) -> list[dict]:
        if area_m2 <= 0:
            raise ValueError("area_m2 must be greater than zero")

        path = Path(video_path)
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        capture = cv2.VideoCapture(str(path))
        if not capture.isOpened():
            raise ValueError(f"Unable to open video file: {video_path}")

        total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        frame_idx = 0
        outputs: list[dict] = []

        try:
            while True:
                ok, frame = capture.read()
                if not ok:
                    break
                frame_idx += 1
                try:
                    result = self.analyze_frame(frame, area_m2)
                    result["frame_index"] = frame_idx
                    outputs.append(result)
                except Exception:
                    logger.exception("Skipping failed frame %s", frame_idx)
                    continue

                if progress_callback is not None:
                    progress = frame_idx / total_frames if total_frames > 0 else 0.0
                    progress_callback(frame_idx, total_frames, progress)
        finally:
            capture.release()

        logger.info("Video analyzed: %s frames processed from %s", len(outputs), video_path)
        return outputs
