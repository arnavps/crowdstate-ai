from __future__ import annotations

import base64
import binascii
import logging
from typing import Any

import cv2
import numpy as np

from ml.lstm_model import LSTMConfig, LSTMVolatilityModel

logger = logging.getLogger(__name__)


class VolatilityDetector:
    def __init__(self):
        self.lstm_config = LSTMConfig()
        self.predictor = LSTMVolatilityModel(self.lstm_config)

    def analyze_movement(self, frames: list[np.ndarray]) -> dict:
        if len(frames) < 2:
            return {
                "movement_variance": 0.0,
                "avg_magnitude": 0.0,
                "direction_change": 0.0,
                "movement_type": "insufficient_data",
            }

        flows: list[np.ndarray] = []
        directions: list[np.ndarray] = []
        magnitudes: list[np.ndarray] = []
        for i in range(len(frames) - 1):
            flow = self.calculate_optical_flow(frames[i], frames[i + 1])
            flows.append(flow)
            mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1], angleInDegrees=True)
            magnitudes.append(mag)
            directions.append(ang)

        variance = self.calculate_velocity_variance(flows)
        avg_magnitude = float(np.mean([np.mean(m) for m in magnitudes])) if magnitudes else 0.0
        direction_change = self._direction_change_score(directions)
        movement_score = np.clip(0.55 * variance + 0.30 * avg_magnitude / 10.0 + 0.15 * direction_change, 0.0, 1.0)
        movement_type = "erratic" if movement_score >= 0.6 else "smooth"

        return {
            "movement_variance": round(float(variance), 4),
            "avg_magnitude": round(float(avg_magnitude), 4),
            "direction_change": round(float(direction_change), 4),
            "movement_type": movement_type,
            "movement_score": round(float(movement_score), 4),
        }

    def calculate_optical_flow(self, frame1: np.ndarray, frame2: np.ndarray) -> np.ndarray:
        if frame1 is None or frame2 is None:
            raise ValueError("Frames cannot be None")
        if frame1.size == 0 or frame2.size == 0:
            raise ValueError("Frames cannot be empty")

        g1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY) if frame1.ndim == 3 else frame1
        g2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY) if frame2.ndim == 3 else frame2
        g1 = cv2.resize(g1, (640, 360))
        g2 = cv2.resize(g2, (640, 360))

        flow = cv2.calcOpticalFlowFarneback(
            g1,
            g2,
            None,
            pyr_scale=0.5,
            levels=3,
            winsize=15,
            iterations=3,
            poly_n=5,
            poly_sigma=1.2,
            flags=0,
        )
        return flow

    def calculate_velocity_variance(self, flows: list[np.ndarray]) -> float:
        if not flows:
            return 0.0
        mags = []
        for flow in flows:
            mag = np.sqrt(np.square(flow[..., 0]) + np.square(flow[..., 1]))
            mags.append(float(np.mean(mag)))
        return float(np.clip(np.var(mags) * 4.0, 0.0, 1.0))

    def predict_volatility(self, historical_data: list[dict]) -> dict:
        if len(historical_data) < self.lstm_config.sequence_length:
            raise ValueError(f"Need at least {self.lstm_config.sequence_length} historical points")

        points = historical_data[-self.lstm_config.sequence_length :]
        sequence = np.asarray([[float(p["rho"]), float(p["sigma"])] for p in points], dtype=np.float32)
        sequence = np.clip(sequence, 0.0, 1.0)

        predicted_delta = self.predictor.predict_next_delta(sequence)
        rho_slope = float(np.mean(np.diff(sequence[-20:, 0])))
        sigma_slope = float(np.mean(np.diff(sequence[-20:, 1])))

        if predicted_delta >= 0.65 or rho_slope > 0.01 or sigma_slope > 0.01:
            trend = "increasing"
            predicted_spike = True
        elif predicted_delta <= 0.30 and rho_slope < -0.004 and sigma_slope < -0.004:
            trend = "decreasing"
            predicted_spike = False
        else:
            trend = "stable"
            predicted_spike = predicted_delta >= 0.6

        confidence = float(np.clip(0.55 + abs(rho_slope) * 10 + abs(sigma_slope) * 10, 0.0, 0.99))
        return {
            "predicted_delta_2m": round(predicted_delta, 4),
            "trend": trend,
            "predicted_spike": predicted_spike,
            "confidence": round(confidence, 4),
        }

    @staticmethod
    def calculate_delta(variance: float, trend: str) -> float:
        trend_boost = {"decreasing": -0.08, "stable": 0.0, "increasing": 0.12}.get(trend, 0.0)
        return float(np.clip(variance + trend_boost, 0.0, 1.0))

    @staticmethod
    def decode_base64_frame(frame_base64: str) -> np.ndarray:
        payload = frame_base64
        if "," in frame_base64 and "base64" in frame_base64.split(",", maxsplit=1)[0]:
            payload = frame_base64.split(",", maxsplit=1)[1]
        try:
            raw = base64.b64decode(payload, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("Invalid base64 frame payload") from exc

        arr = np.frombuffer(raw, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Failed to decode video frame")
        return frame

    @staticmethod
    def _direction_change_score(directions: list[np.ndarray]) -> float:
        if len(directions) < 2:
            return 0.0
        mean_dirs = [float(np.mean(d)) for d in directions]
        changes = np.abs(np.diff(mean_dirs))
        normalized = np.clip(np.mean(changes) / 180.0, 0.0, 1.0)
        return float(normalized)
