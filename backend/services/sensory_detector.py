from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import librosa
import numpy as np

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AudioConfig:
    sample_rate: int = 22050
    fft_window: int = 2048
    chunk_seconds: int = 5
    max_frequency_hz: int = 8000


class SensoryDetector:
    """FFT-based sensory load detector for crowd audio environments."""

    def __init__(self, config: AudioConfig | None = None):
        self.config = config or AudioConfig()

    def analyze_audio(self, audio_path: str) -> dict:
        started = time.perf_counter()
        try:
            audio_data, sr = librosa.load(
                audio_path,
                sr=self.config.sample_rate,
                mono=True,
            )
        except Exception as exc:
            logger.exception("Failed to load audio: %s", audio_path)
            raise ValueError("Unsupported or unreadable audio file") from exc

        if audio_data.size == 0:
            raise ValueError("Audio file is empty")

        result = self.analyze_audio_chunk(audio_data=audio_data, sr=sr)
        result["inference_time_ms"] = round((time.perf_counter() - started) * 1000, 2)
        return result

    def analyze_audio_chunk(self, audio_data: np.ndarray, sr: int) -> dict:
        if audio_data is None or audio_data.size == 0:
            raise ValueError("audio_data is empty")
        if sr <= 0:
            raise ValueError("Invalid sample rate")

        audio = np.asarray(audio_data, dtype=np.float32)
        peak = float(np.max(np.abs(audio)))
        if peak > 0:
            audio = audio / peak

        chunk_size = int(self.config.chunk_seconds * sr)
        if chunk_size <= 0:
            raise ValueError("Invalid chunk size")

        distress_hits = 0
        db_values: list[float] = []
        frequency_profiles: list[dict] = []

        # Retain hooks for low-latency / streaming use in future revisions.
        for idx in range(0, len(audio), chunk_size):
            chunk = audio[idx : idx + chunk_size]
            if chunk.size < self.config.fft_window // 2:
                continue

            fft_result = np.fft.rfft(chunk, n=self.config.fft_window)
            freq_bins = np.fft.rfftfreq(self.config.fft_window, d=1.0 / sr)

            distress_detected = self.detect_distress_frequencies(fft_result, chunk, sr)
            distress_hits += int(distress_detected)

            db_level = self.calculate_db_level(chunk)
            db_values.append(db_level)
            frequency_profiles.append(self._build_frequency_profile(fft_result, freq_bins))

        if not db_values:
            db_level = self.calculate_db_level(audio)
            fft_result = np.fft.rfft(audio[: self.config.fft_window], n=self.config.fft_window)
            freq_bins = np.fft.rfftfreq(self.config.fft_window, d=1.0 / sr)
            distress_detected = self.detect_distress_frequencies(fft_result, audio, sr)
            sigma = self.calculate_sigma(db_level=db_level, distress_detected=distress_detected)
            return {
                "sigma": sigma,
                "db_level": db_level,
                "distress_detected": distress_detected,
                "frequency_profile": self._build_frequency_profile(fft_result, freq_bins),
            }

        avg_db = float(np.mean(db_values))
        distress_detected = distress_hits > 0
        sigma = self.calculate_sigma(db_level=avg_db, distress_detected=distress_detected)
        frequency_profile = self._merge_frequency_profiles(frequency_profiles)

        return {
            "sigma": sigma,
            "db_level": round(avg_db, 2),
            "distress_detected": distress_detected,
            "frequency_profile": frequency_profile,
        }

    def detect_distress_frequencies(
        self,
        fft_result: np.ndarray,
        audio_chunk: np.ndarray | None = None,
        sr: int | None = None,
    ) -> bool:
        if fft_result.size == 0:
            return False

        magnitudes = np.abs(fft_result)
        freq_bins = np.fft.rfftfreq(self.config.fft_window, d=1.0 / self.config.sample_rate)
        band_mask = (freq_bins >= 3000) & (freq_bins <= 8000)
        low_mask = (freq_bins >= 200) & (freq_bins < 3000)
        if not np.any(band_mask) or not np.any(low_mask):
            return False

        high_band = magnitudes[band_mask]
        low_band = magnitudes[low_mask]
        high_energy = float(np.mean(high_band))
        low_energy = float(np.mean(low_band)) + 1e-9
        spike_ratio = high_energy / low_energy
        spectral_peak = float(np.max(high_band)) / (float(np.median(high_band)) + 1e-9)

        sudden_change = False
        sustained_high_noise = False
        if audio_chunk is not None and audio_chunk.size > 256:
            rms = librosa.feature.rms(y=audio_chunk, frame_length=1024, hop_length=512)[0]
            if rms.size > 2:
                jumps = np.diff(rms)
                sudden_change = float(np.max(jumps)) > 0.25
                sustained_high_noise = float(np.mean(rms > 0.35)) > 0.35

        return bool((spike_ratio > 1.8 and spectral_peak > 3.0) or sudden_change or sustained_high_noise)

    @staticmethod
    def calculate_db_level(audio_data: np.ndarray) -> float:
        if audio_data.size == 0:
            raise ValueError("audio_data is empty")
        rms = float(np.sqrt(np.mean(np.square(audio_data))))
        db = 20.0 * np.log10(max(rms, 1e-9))
        # Convert digital dBFS-like value to practical dB scale (approximation).
        return round(max(35.0, min(120.0, db + 100.0)), 2)

    @staticmethod
    def calculate_sigma(db_level: float, distress_detected: bool) -> float:
        db_component = (db_level - 45.0) / 45.0
        base = max(0.0, min(1.0, db_component))
        if distress_detected:
            base = min(1.0, base + 0.2)
        return round(base, 4)

    def generate_spectrogram(self, audio_data: np.ndarray, sr: int) -> list[list[float]]:
        """Optional helper: returns a mel-spectrogram matrix for visualization."""
        mel = librosa.feature.melspectrogram(y=audio_data, sr=sr, n_fft=self.config.fft_window)
        db_mel = librosa.power_to_db(mel, ref=np.max)
        return db_mel.tolist()

    def _build_frequency_profile(self, fft_result: np.ndarray, freq_bins: np.ndarray) -> dict:
        magnitudes = np.abs(fft_result)
        mask = freq_bins <= self.config.max_frequency_hz
        freqs = freq_bins[mask]
        mags = magnitudes[mask]
        if mags.size == 0:
            return {"0_1000": 0.0, "1000_3000": 0.0, "3000_8000": 0.0}

        def band_energy(low: float, high: float) -> float:
            band = mags[(freqs >= low) & (freqs < high)]
            return float(np.mean(band)) if band.size else 0.0

        e0 = band_energy(0, 1000)
        e1 = band_energy(1000, 3000)
        e2 = band_energy(3000, 8000)
        total = e0 + e1 + e2 + 1e-9
        return {
            "0_1000": round(e0 / total, 4),
            "1000_3000": round(e1 / total, 4),
            "3000_8000": round(e2 / total, 4),
        }

    @staticmethod
    def _merge_frequency_profiles(profiles: list[dict]) -> dict:
        if not profiles:
            return {"0_1000": 0.0, "1000_3000": 0.0, "3000_8000": 0.0}
        keys = ("0_1000", "1000_3000", "3000_8000")
        merged = {k: 0.0 for k in keys}
        for profile in profiles:
            for k in keys:
                merged[k] += float(profile.get(k, 0.0))
        count = float(len(profiles))
        return {k: round(v / count, 4) for k, v in merged.items()}
