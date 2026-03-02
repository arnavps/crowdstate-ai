import cv2
import numpy as np
import librosa
import torch
from ultralytics import YOLO
from model import get_model
import time
from collections import deque
from typing import Dict, List, Optional

class CrowdEngine:
    def __init__(self, model_path: str = "yolov8n.pt"):
        # Initialize YOLOv8
        self.model = YOLO(model_path)
        
        # Initialize LSTM Predictor
        self.predictor = get_model()
        
        # State Vector History for Volatility and Prediction
        # 50 samples for prediction input
        self.history = deque(maxlen=50)
        self.rho_history = deque(maxlen=10) # For delta calculation
        
        self.rho = 0.0
        self.sigma = 0.0
        self.delta = 0.0
        self.predictions: List[Dict[str, float]] = []

    def update_history(self):
        self.history.append([self.rho, self.sigma, self.delta])

    def predict_future(self):
        """
        Use LSTM to predict the next 10 state vectors based on history.
        """
        if len(self.history) < 10: # Minimum history needed for mock
            return []
            
        # Convert history to tensor (mocking the input for the skeleton)
        input_data = torch.tensor([list(self.history)], dtype=torch.float32)
        with torch.no_grad():
            preds = self.predictor(input_data).numpy()[0]
            
        self.predictions = [
            {"rho": float(p[0]), "sigma": float(p[1]), "delta": float(p[2])}
            for p in preds
        ]
        return self.predictions

    def process_video_frame(self, frame: np.ndarray) -> float:
        """
        Calculate Physical Density (rho) based on person-count and centroid-velocity.
        """
        results = self.model(frame, verbose=False)[0]
        
        # Filter for 'person' class (index 0 in COCO)
        persons = [box for box in results.boxes if int(box.cls[0]) == 0]
        person_count = len(persons)
        
        # Simplistic rho calculation: normalized person count + basic 'activity' heuristic
        # In a real scenario, this would involve homography for real m^2 density
        new_rho = person_count / 10.0 # Normalized for demo purposes
        
        self.rho = new_rho
        self.rho_history.append((time.time(), new_rho))
        
        # Calculate Delta (Volatility) as derivative of rho
        self.calculate_delta()
        
        return self.rho

    def process_audio_buffer(self, audio_data: np.ndarray, sr: int = 22050) -> float:
        """
        Calculate Sensory Load (sigma) via FFT and decibel variance.
        """
        if len(audio_data) == 0:
            return self.sigma
            
        # Perform STFT
        stft = np.abs(librosa.stft(audio_data))
        db = librosa.amplitude_to_db(stft, ref=np.max)
        
        # Calculate variance in decibels as a proxy for sensory pressure/chaos
        db_variance = np.var(db)
        
        # Normalize sigma (heuristic)
        self.sigma = float(np.clip(db_variance / 100.0, 0, 1))
        
        return self.sigma

    def calculate_delta(self):
        """
        Calculate Volatility (delta) as the derivative of rho over the history window.
        """
        if len(self.rho_history) < 2:
            self.delta = 0.0
            return
            
        times = [h[0] for h in self.rho_history]
        values = [h[1] for h in self.rho_history]
        
        # Simple finite difference / slope
        dt = times[-1] - times[0]
        if dt > 0:
            dv = values[-1] - values[0]
            self.delta = abs(dv / dt)
        else:
            self.delta = 0.0

    def get_state_vector(self) -> Dict:
        """
        Return the current 3-State Vector including 10-step predictions.
        Data is normalized to [0, 1] range for B2B analytics.
        """
        # Normalization constraints (empirical urban baseline)
        norm_rho = min(1.0, self.rho / 5.0)  # Max density ~5 people/m2
        norm_sigma = min(1.0, self.sigma / 120.0) # Max sensory load ~120dB variance
        norm_delta = min(1.0, self.delta / 0.5) # Max volatility spike 0.5/s

        return {
            "rho": round(float(norm_rho), 4),
            "sigma": round(float(norm_sigma), 4),
            "delta": round(float(norm_delta), 4),
            "predictions": [
                {
                    "rho": round(min(1.0, p["rho"] / 5.0), 4),
                    "sigma": round(min(1.0, p["sigma"] / 120.0), 4),
                    "delta": round(min(1.0, p["delta"] / 0.5), 4)
                }
                for p in self.predictions
            ]
        }
