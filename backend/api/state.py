"""State calculation API endpoints."""

from __future__ import annotations

import logging
import time
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.state_engine import state_engine, StatusClassification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/calculate", tags=["state"])


class StateCalculateRequest(BaseModel):
    """Request model for state calculation."""
    rho: float = Field(..., ge=0.0, le=1.0, description="Density metric (0-1)")
    sigma: float = Field(..., ge=0.0, le=1.0, description="Sensory metric (0-1)")
    delta: float = Field(..., ge=0.0, le=1.0, description="Volatility metric (0-1)")
    persona: str = Field(default="commuter", description="User persona type")
    location_id: str | None = Field(default=None, description="Location identifier for history tracking")


class AlertResponse(BaseModel):
    """Alert in response."""
    type: str
    message: str
    priority: str
    metric: str | None = None
    threshold: float | None = None
    current_value: float | None = None


class StateCalculateResponse(BaseModel):
    """Response model for state calculation."""
    state_score: float
    status: str
    message: str
    alerts: list[AlertResponse]
    recommendations: list[str]
    timestamp: float
    persona: str
    weights: dict[str, float]
    raw_scores: dict[str, float]
    telemetry: dict[str, Any]


class ThresholdUpdateRequest(BaseModel):
    """Request to update threshold configuration."""
    rho_critical: float | None = Field(default=None, ge=0.0, le=1.0)
    rho_warning: float | None = Field(default=None, ge=0.0, le=1.0)
    sigma_critical: float | None = Field(default=None, ge=0.0, le=1.0)
    sigma_warning: float | None = Field(default=None, ge=0.0, le=1.0)
    delta_critical: float | None = Field(default=None, ge=0.0, le=1.0)
    delta_warning: float | None = Field(default=None, ge=0.0, le=1.0)
    score_safe_max: float | None = Field(default=None, ge=0.0, le=100.0)
    score_caution_max: float | None = Field(default=None, ge=0.0, le=100.0)


class ThresholdConfigResponse(BaseModel):
    """Current threshold configuration."""
    rho_critical: float
    rho_warning: float
    sigma_critical: float
    sigma_warning: float
    delta_critical: float
    delta_warning: float
    score_safe_max: float
    score_caution_max: float
    volatility_window_seconds: int


@router.post("/state", response_model=StateCalculateResponse)
async def calculate_state(request: StateCalculateRequest) -> StateCalculateResponse:
    """Calculate unified state from ρ, Σ, Δ metrics.

    Returns state score (0-100), status classification, alerts, and recommendations.
    """
    try:
        result = state_engine.calculate_state(
            rho=request.rho,
            sigma=request.sigma,
            delta=request.delta,
            persona=request.persona,
            location_id=request.location_id,
        )

        data = result.to_dict()
        return StateCalculateResponse(
            state_score=data["state_score"],
            status=data["status"],
            message=data["message"],
            alerts=[AlertResponse(**a) for a in data["alerts"]],
            recommendations=data["recommendations"],
            timestamp=data["timestamp"],
            persona=data["persona"],
            weights=data["weights"],
            raw_scores=data["raw_scores"],
            telemetry=data["telemetry"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("State calculation failed")
        raise HTTPException(status_code=500, detail="State calculation failed") from exc


@router.get("/state/config", response_model=ThresholdConfigResponse)
async def get_threshold_config() -> ThresholdConfigResponse:
    """Get current threshold configuration."""
    config = state_engine.get_config()
    return ThresholdConfigResponse(
        rho_critical=config.RHO_CRITICAL,
        rho_warning=config.RHO_WARNING,
        sigma_critical=config.SIGMA_CRITICAL,
        sigma_warning=config.SIGMA_WARNING,
        delta_critical=config.DELTA_CRITICAL,
        delta_warning=config.DELTA_WARNING,
        score_safe_max=config.SCORE_SAFE_MAX,
        score_caution_max=config.SCORE_CAUTION_MAX,
        volatility_window_seconds=config.VOLATILITY_WINDOW_SECONDS,
    )


@router.post("/state/config")
async def update_threshold_config(request: ThresholdUpdateRequest) -> dict[str, str]:
    """Update threshold configuration."""
    try:
        updates = {k: v for k, v in request.model_dump().items() if v is not None}
        if updates:
            state_engine.update_config(**updates)
        return {"status": "updated", "updated_fields": list(updates.keys())}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/state/clear-history")
async def clear_history(location_id: str | None = None) -> dict[str, str]:
    """Clear calculation history for a location or all locations."""
    state_engine.clear_history(location_id)
    if location_id:
        return {"status": "cleared", "location_id": location_id}
    return {"status": "cleared", "scope": "all"}
