from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.volatility_detector import VolatilityDetector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyze", tags=["volatility"])
detector = VolatilityDetector()


class HistoryPoint(BaseModel):
    rho: float = Field(..., ge=0, le=1)
    sigma: float = Field(..., ge=0, le=1)


class VolatilityRequest(BaseModel):
    location_id: str
    video_frames: list[str] | None = None
    historical_data: list[HistoryPoint] = Field(..., min_length=60)


class VolatilityResponse(BaseModel):
    delta: float
    movement_variance: float
    predicted_spike: bool
    trend: str
    confidence: float
    status: str


def get_status(delta: float) -> str:
    if delta < 0.3:
        return "STABLE"
    if delta < 0.6:
        return "FLUCTUATING"
    return "VOLATILE"


@router.post("/volatility", response_model=VolatilityResponse)
async def analyze_volatility(payload: VolatilityRequest) -> VolatilityResponse:
    try:
        movement_variance = 0.0
        if payload.video_frames:
            frames = [detector.decode_base64_frame(frame) for frame in payload.video_frames]
            movement = detector.analyze_movement(frames)
            movement_variance = float(movement["movement_variance"])

        prediction = detector.predict_volatility([p.model_dump() for p in payload.historical_data])
        delta = detector.calculate_delta(variance=max(movement_variance, prediction["predicted_delta_2m"]), trend=prediction["trend"])
        return VolatilityResponse(
            delta=round(delta, 4),
            movement_variance=round(movement_variance, 4),
            predicted_spike=bool(prediction["predicted_spike"]),
            trend=str(prediction["trend"]),
            confidence=float(prediction["confidence"]),
            status=get_status(delta),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unhandled volatility analysis failure")
        raise HTTPException(status_code=500, detail="Volatility analysis failed") from exc
