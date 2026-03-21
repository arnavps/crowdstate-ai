from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from services.sensory_detector import SensoryDetector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyze", tags=["sensory"])
detector = SensoryDetector()
ALLOWED_SUFFIXES = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}


class SensoryAnalyzeResponse(BaseModel):
    sigma: float
    db_level: float
    distress_detected: bool
    frequency_profile: dict
    status: str


def calculate_status(sigma: float) -> str:
    if sigma < 0.4:
        return "LOW"
    if sigma < 0.7:
        return "MODERATE"
    return "HIGH"


@router.post("/sensory", response_model=SensoryAnalyzeResponse)
async def analyze_sensory(
    audio: UploadFile = File(...),
    include_spectrogram: bool = Form(False),
) -> SensoryAnalyzeResponse:
    suffix = Path(audio.filename or "").suffix.lower()
    if suffix and suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {suffix}. Allowed: {sorted(ALLOWED_SUFFIXES)}",
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix or ".wav") as tmp:
            tmp.write(await audio.read())
            temp_path = tmp.name
        try:
            result = detector.analyze_audio(temp_path)
        finally:
            Path(temp_path).unlink(missing_ok=True)

        payload = {
            "sigma": result["sigma"],
            "db_level": result["db_level"],
            "distress_detected": result["distress_detected"],
            "frequency_profile": result["frequency_profile"],
            "status": calculate_status(result["sigma"]),
        }

        # Optional spectrogram field retained for client experimentation.
        if include_spectrogram:
            payload["frequency_profile"]["spectrogram_included"] = True

        return SensoryAnalyzeResponse.model_validate(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unhandled sensory analysis failure")
        raise HTTPException(status_code=500, detail="Sensory analysis failed") from exc
