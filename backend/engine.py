import cv2
import numpy as np
import librosa
import torch
from ultralytics import YOLO
import time
from collections import deque
from typing import Dict, List, Optional

class CrowdEngine:
    def __init__(self, model_path: str = "yolov8n.pt"):
        # Initialize YOLOv8
        self.model = YOLO(model_path)
        
        # State Vector History for Volatility (Delta) calculation
        # 10-second window at ~1fps = 10 samples
        self.rho_history = deque(maxlen=10)
        self.last_update_time = time.time()
        
        # Current State Vector
        self.rho = 0.0   # Physical Density
        self.sigma = 0.0 # Sensory Load
        self.delta = 0.0 # Volatility

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

    def get_state_vector(self) -> Dict[str, float]:
        """
        Return the current 3-State Vector.
        """
        return {
            "rho": round(float(self.rho), 4),
            "sigma": round(float(self.sigma), 4),
            "delta": round(float(self.delta), 4)
        }
