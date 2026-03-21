from __future__ import annotations

import json
import logging
import pickle
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

try:
    import tensorflow as tf
    from tensorflow.keras import Sequential
    from tensorflow.keras.callbacks import ModelCheckpoint
    from tensorflow.keras.layers import LSTM, Dense, Dropout
except Exception:  # pragma: no cover - runtime fallback when TF missing
    tf = None
    Sequential = None
    ModelCheckpoint = None
    LSTM = None
    Dense = None
    Dropout = None


@dataclass(frozen=True)
class LSTMConfig:
    sequence_length: int = 60
    feature_count: int = 2
    units: int = 64
    layers: int = 2
    prediction_seconds: int = 120
    model_version: str = "v1.0.0"


class LSTMVolatilityModel:
    def __init__(self, config: LSTMConfig | None = None):
        self.config = config or LSTMConfig()
        self.base_dir = Path(__file__).resolve().parents[1]
        self.data_dir = self.base_dir / "data"
        self.ml_dir = self.base_dir / "ml"
        self.checkpoint_dir = self.ml_dir / "checkpoints" / self.config.model_version
        self.model_path = self.checkpoint_dir / "volatility_lstm.keras"
        self.version_file = self.checkpoint_dir / "version.json"
        self.training_data_path = self.data_dir / "training_data.pkl"
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self._model = None

    def generate_synthetic_training_data(self, scenarios: int = 1000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
        rng = np.random.default_rng(seed)
        x_data: list[np.ndarray] = []
        y_data: list[float] = []

        for _ in range(scenarios):
            scenario_kind = rng.choice(["normal", "gradual", "surge"], p=[0.7, 0.2, 0.1])
            rho = np.zeros(self.config.sequence_length, dtype=np.float32)
            sigma = np.zeros(self.config.sequence_length, dtype=np.float32)

            # Basic physics-inspired dynamics: inertia + drift + random forcing.
            vel = rng.uniform(0.0, 0.05)
            for i in range(self.config.sequence_length):
                noise = rng.normal(0.0, 0.02)
                if scenario_kind == "normal":
                    drift = rng.uniform(-0.005, 0.005)
                elif scenario_kind == "gradual":
                    drift = rng.uniform(0.001, 0.010)
                else:
                    drift = rng.uniform(-0.002, 0.020)
                    if i > self.config.sequence_length * 0.7:
                        drift += rng.uniform(0.03, 0.08)

                vel = 0.85 * vel + drift + noise
                rho[i] = np.clip((rho[i - 1] if i > 0 else rng.uniform(0.15, 0.45)) + vel, 0.0, 1.0)
                sigma[i] = np.clip(
                    (sigma[i - 1] if i > 0 else rng.uniform(0.10, 0.40))
                    + 0.75 * vel
                    + rng.normal(0.0, 0.02),
                    0.0,
                    1.0,
                )

            recent_var = float(np.var(np.diff(rho[-20:])))
            trend_component = float(max(0.0, np.mean(np.diff(rho[-15:]))))
            sensory_component = float(np.mean(sigma[-15:]))
            target_delta = np.clip(0.45 * recent_var * 20 + 0.30 * trend_component * 10 + 0.25 * sensory_component, 0, 1)

            x_data.append(np.stack([rho, sigma], axis=1))
            y_data.append(float(target_delta))

        x = np.asarray(x_data, dtype=np.float32)
        y = np.asarray(y_data, dtype=np.float32)
        with self.training_data_path.open("wb") as f:
            pickle.dump({"x": x, "y": y, "meta": {"scenarios": scenarios}}, f)
        logger.info("Saved synthetic training data to %s", self.training_data_path)
        return x, y

    def _build_model(self):
        if tf is None:
            raise RuntimeError("TensorFlow is not available")

        model = Sequential(
            [
                LSTM(self.config.units, return_sequences=True, input_shape=(self.config.sequence_length, self.config.feature_count)),
                Dropout(0.2),
                LSTM(self.config.units),
                Dropout(0.2),
                Dense(32, activation="relu"),
                Dense(1, activation="sigmoid"),
            ]
        )
        model.compile(optimizer="adam", loss="mse", metrics=["mae"])
        return model

    def train(self, epochs: int = 8, batch_size: int = 32) -> dict[str, Any]:
        if tf is None:
            raise RuntimeError("TensorFlow is required for training")

        if self.training_data_path.exists():
            with self.training_data_path.open("rb") as f:
                payload = pickle.load(f)
            x, y = payload["x"], payload["y"]
        else:
            x, y = self.generate_synthetic_training_data(scenarios=1000)

        split = int(0.8 * len(x))
        x_train, y_train = x[:split], y[:split]
        x_val, y_val = x[split:], y[split:]

        model = self._build_model()
        checkpoint_cb = ModelCheckpoint(filepath=str(self.model_path), save_best_only=True, monitor="val_loss", mode="min")
        history = model.fit(
            x_train,
            y_train,
            validation_data=(x_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            verbose=0,
            callbacks=[checkpoint_cb],
        )
        self._model = model
        self._write_version_metadata(history=history.history)
        logger.info("Trained volatility model saved at %s", self.model_path)
        return {"epochs": epochs, "model_path": str(self.model_path)}

    def _write_version_metadata(self, history: dict[str, Any] | None = None) -> None:
        payload = {
            "model_version": self.config.model_version,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "framework": "tensorflow.keras",
            "sequence_length": self.config.sequence_length,
            "feature_count": self.config.feature_count,
            "history_keys": sorted(list(history.keys())) if history else [],
        }
        with self.version_file.open("w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

    def load_or_train(self):
        if tf is None:
            logger.warning("TensorFlow unavailable, using heuristic predictor fallback")
            return None

        if self._model is not None:
            return self._model
        if self.model_path.exists():
            self._model = tf.keras.models.load_model(self.model_path)
            return self._model
        self.train()
        self._model = tf.keras.models.load_model(self.model_path)
        return self._model

    def predict_next_delta(self, sequence: np.ndarray) -> float:
        if sequence.shape != (self.config.sequence_length, self.config.feature_count):
            raise ValueError(f"Expected shape {(self.config.sequence_length, self.config.feature_count)}")

        model = self.load_or_train()
        if model is None:
            # Heuristic fallback when TF is missing.
            rho = sequence[:, 0]
            sigma = sequence[:, 1]
            val = np.clip(0.5 * np.var(np.diff(rho)) * 20 + 0.3 * np.mean(np.diff(rho[-20:])) * 10 + 0.2 * np.mean(sigma[-20:]), 0, 1)
            return float(val)

        pred = model.predict(sequence[np.newaxis, ...], verbose=0)[0][0]
        return float(np.clip(pred, 0.0, 1.0))
