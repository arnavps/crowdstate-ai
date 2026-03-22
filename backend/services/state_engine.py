"""State Fusion Engine - Combines ρ, Σ, Δ into unified state with persona-based weighting."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class StatusClassification(Enum):
    """State status classifications."""
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    DANGER = "DANGER"


class AlertPriority(Enum):
    """Alert priority levels."""
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class Persona(Enum):
    """User persona types with associated weight profiles."""
    COMMUTER = "commuter"
    NEURODIVERGENT = "neurodivergent"
    FIRST_RESPONDER = "first_responder"
    STATION_MANAGER = "station_manager"


# Persona weight profiles
PERSONA_WEIGHTS = {
    Persona.COMMUTER: {"rho": 0.6, "sigma": 0.2, "delta": 0.2},
    Persona.NEURODIVERGENT: {"rho": 0.2, "sigma": 0.6, "delta": 0.2},
    Persona.FIRST_RESPONDER: {"rho": 0.2, "sigma": 0.2, "delta": 0.6},
    Persona.STATION_MANAGER: {"rho": 0.4, "sigma": 0.3, "delta": 0.3},
}


@dataclass
class Alert:
    """Alert data structure."""
    type: str
    message: str
    priority: AlertPriority
    metric: str | None = None
    threshold: float | None = None
    current_value: float | None = None


@dataclass
class StateResult:
    """Complete state calculation result."""
    state_score: float
    status: StatusClassification
    message: str
    alerts: list[Alert] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)
    persona: Persona = Persona.COMMUTER
    weights: dict[str, float] = field(default_factory=dict)
    raw_scores: dict[str, float] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    telemetry: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "state_score": round(self.state_score, 2),
            "status": self.status.value,
            "message": self.message,
            "alerts": [
                {
                    "type": a.type,
                    "message": a.message,
                    "priority": a.priority.value,
                    "metric": a.metric,
                    "threshold": a.threshold,
                    "current_value": round(a.current_value, 3) if a.current_value else None,
                }
                for a in self.alerts
            ],
            "recommendations": self.recommendations,
            "persona": self.persona.value,
            "weights": {k: round(v, 2) for k, v in self.weights.items()},
            "raw_scores": {k: round(v, 3) for k, v in self.raw_scores.items()},
            "timestamp": self.timestamp,
            "telemetry": self.telemetry,
        }


class ThresholdConfig:
    """Configuration for metric thresholds and tuning."""

    # Metric thresholds (0-1 scale)
    RHO_CRITICAL = 0.8
    RHO_WARNING = 0.6
    SIGMA_CRITICAL = 0.7
    SIGMA_WARNING = 0.5
    DELTA_CRITICAL = 0.7
    DELTA_WARNING = 0.5

    # Rapid change detection (derivative thresholds)
    RHO_DERIVATIVE_THRESHOLD = 0.1  # 10% change
    SIGMA_DERIVATIVE_THRESHOLD = 0.15
    DELTA_DERIVATIVE_THRESHOLD = 0.15

    # Safety score thresholds
    SCORE_SAFE_MAX = 40
    SCORE_CAUTION_MAX = 70

    # Volatility safety window (seconds)
    VOLATILITY_WINDOW_SECONDS = 180

    @classmethod
    def update_thresholds(cls, **kwargs: float) -> None:
        """Update threshold values dynamically."""
        for key, value in kwargs.items():
            if hasattr(cls, key.upper()):
                setattr(cls, key.upper(), value)
                logger.info(f"Updated threshold {key} to {value}")


class StateEngine:
    """State Fusion Engine - combines metrics into unified state."""

    def __init__(self) -> None:
        self._history: dict[str, list[dict[str, float]]] = {}
        self._config = ThresholdConfig()

    def _get_weights(self, persona: Persona) -> dict[str, float]:
        """Get weight profile for persona."""
        return PERSONA_WEIGHTS.get(persona, PERSONA_WEIGHTS[Persona.COMMUTER])

    def _calculate_score(
        self, rho: float, sigma: float, delta: float, weights: dict[str, float]
    ) -> float:
        """Calculate weighted state score (0-100)."""
        score = rho * weights["rho"] + sigma * weights["sigma"] + delta * weights["delta"]
        return min(100.0, max(0.0, score * 100))

    def _classify_status(self, score: float) -> StatusClassification:
        """Classify state based on score."""
        if score <= self._config.SCORE_SAFE_MAX:
            return StatusClassification.SAFE
        if score <= self._config.SCORE_CAUTION_MAX:
            return StatusClassification.CAUTION
        return StatusClassification.DANGER

    def _generate_message(
        self, rho: float, sigma: float, delta: float, status: StatusClassification
    ) -> str:
        """Generate human-readable state message."""
        # Critical conditions
        if rho > 0.8 and sigma > 0.7 and delta > 0.7:
            return "Critical: Evacuation recommended"
        if rho > 0.8 and delta > 0.7:
            return "Critical density with high volatility - avoid area"

        # High sensory load
        if sigma > 0.7:
            return "High sensory load - recommend AuraPath"
        if sigma > 0.5 and rho > 0.5:
            return "High sensory density - consider quieter route"

        # Density + volatility combinations
        if rho > 0.6 and delta > 0.6:
            return "Crowded and volatile - proceed with caution"
        if rho > 0.6 and delta < 0.3:
            return "Crowded but calm"
        if rho < 0.3 and delta > 0.6:
            return "Sparse but volatile - stay alert"

        # Status-based fallbacks
        if status == StatusClassification.SAFE:
            if rho < 0.3:
                return "Low density, stable conditions"
            return "Normal conditions"
        if status == StatusClassification.CAUTION:
            return "Elevated conditions - monitor situation"

        return "Dangerous conditions - seek alternative route"

    def _check_derivative(
        self, location_id: str, metric: str, current: float, threshold: float
    ) -> bool:
        """Check for rapid change in metric (derivative detection)."""
        if location_id not in self._history:
            self._history[location_id] = []

        history = self._history[location_id]
        if len(history) < 2:
            history.append({"time": time.time(), metric: current})
            return False

        # Keep last 10 readings
        if len(history) > 10:
            history.pop(0)

        prev = history[-1].get(metric, current)
        change = abs(current - prev)
        history.append({"time": time.time(), metric: current})

        return change > threshold

    def _generate_alerts(
        self,
        rho: float,
        sigma: float,
        delta: float,
        location_id: str | None,
    ) -> list[Alert]:
        """Generate alerts based on thresholds and derivatives."""
        alerts: list[Alert] = []

        # Density alerts
        if rho > self._config.RHO_CRITICAL:
            alerts.append(Alert(
                type="density_critical",
                message="Density approaching capacity",
                priority=AlertPriority.CRITICAL,
                metric="rho",
                threshold=self._config.RHO_CRITICAL,
                current_value=rho,
            ))
        elif rho > self._config.RHO_WARNING:
            alerts.append(Alert(
                type="density_warning",
                message="Elevated density detected",
                priority=AlertPriority.WARNING,
                metric="rho",
                threshold=self._config.RHO_WARNING,
                current_value=rho,
            ))

        # Sensory alerts
        if sigma > self._config.SIGMA_CRITICAL:
            alerts.append(Alert(
                type="sensory_critical",
                message="Sensory spike detected - high stimulus environment",
                priority=AlertPriority.CRITICAL,
                metric="sigma",
                threshold=self._config.SIGMA_CRITICAL,
                current_value=sigma,
            ))
        elif sigma > self._config.SIGMA_WARNING:
            alerts.append(Alert(
                type="sensory_warning",
                message="Elevated sensory load",
                priority=AlertPriority.WARNING,
                metric="sigma",
                threshold=self._config.SIGMA_WARNING,
                current_value=sigma,
            ))

        # Volatility alerts
        if delta > self._config.DELTA_CRITICAL:
            alerts.append(Alert(
                type="volatility_critical",
                message=f"Volatility warning: {self._config.VOLATILITY_WINDOW_SECONDS}s safety window",
                priority=AlertPriority.CRITICAL,
                metric="delta",
                threshold=self._config.DELTA_CRITICAL,
                current_value=delta,
            ))
        elif delta > self._config.DELTA_WARNING:
            alerts.append(Alert(
                type="volatility_warning",
                message="Elevated volatility detected",
                priority=AlertPriority.WARNING,
                metric="delta",
                threshold=self._config.DELTA_WARNING,
                current_value=delta,
            ))

        # Derivative alerts (rapid changes)
        if location_id:
            if self._check_derivative(location_id, "rho", rho, self._config.RHO_DERIVATIVE_THRESHOLD):
                alerts.append(Alert(
                    type="density_spike",
                    message="Rapid density change detected",
                    priority=AlertPriority.WARNING,
                    metric="rho_derivative",
                    current_value=rho,
                ))
            if self._check_derivative(location_id, "sigma", sigma, self._config.SIGMA_DERIVATIVE_THRESHOLD):
                alerts.append(Alert(
                    type="sensory_spike",
                    message="Rapid sensory change detected",
                    priority=AlertPriority.WARNING,
                    metric="sigma_derivative",
                    current_value=sigma,
                ))
            if self._check_derivative(location_id, "delta", delta, self._config.DELTA_DERIVATIVE_THRESHOLD):
                alerts.append(Alert(
                    type="volatility_spike",
                    message="Rapid volatility change detected",
                    priority=AlertPriority.WARNING,
                    metric="delta_derivative",
                    current_value=delta,
                ))

        return alerts

    def _generate_recommendations(
        self,
        rho: float,
        sigma: float,
        delta: float,
        status: StatusClassification,
        persona: Persona,
    ) -> list[str]:
        """Generate persona-based actionable recommendations."""
        recommendations: list[str] = []

        # Persona-specific recommendations
        if persona == Persona.NEURODIVERGENT:
            if sigma > 0.5:
                recommendations.append("Route via quieter platform or entrance")
            if rho > 0.6:
                recommendations.append("Wait 5-10 minutes for lower density")
            if delta > 0.5:
                recommendations.append("Use AuraPath sensory-friendly navigation")

        elif persona == Persona.FIRST_RESPONDER:
            if delta > 0.6:
                recommendations.append("Deploy to secondary access point")
            if rho > 0.7:
                recommendations.append("Pre-stage emergency equipment")
            if status == StatusClassification.DANGER:
                recommendations.append("Emergency: Clear area immediately")

        elif persona == Persona.STATION_MANAGER:
            if rho > 0.6:
                recommendations.append("Activate crowd flow management")
            if sigma > 0.5:
                recommendations.append("Adjust lighting/audio levels")
            if delta > 0.5:
                recommendations.append("Alert platform staff to monitor situation")

        else:  # COMMUTER (default)
            if rho > 0.7:
                recommendations.append("Use alternative entrance")
            if sigma > 0.6:
                recommendations.append("Consider quieter route via Platform 2")
            if delta > 0.6:
                recommendations.append("Wait 5 minutes for stable conditions")
            if status == StatusClassification.SAFE and rho < 0.4:
                recommendations.append("Optimal conditions - proceed normally")

        # Universal critical recommendations
        if status == StatusClassification.DANGER:
            if not any("Emergency" in r for r in recommendations):
                recommendations.insert(0, "Emergency: Clear area immediately")

        return recommendations

    def _generate_telemetry(
        self,
        rho: float,
        sigma: float,
        delta: float,
        score: float,
        weights: dict[str, float],
        processing_time_ms: float,
    ) -> dict[str, Any]:
        """Generate telemetry data for monitoring and analytics."""
        return {
            "processing_time_ms": round(processing_time_ms, 2),
            "weighted_rho": round(rho * weights["rho"], 4),
            "weighted_sigma": round(sigma * weights["sigma"], 4),
            "weighted_delta": round(delta * weights["delta"], 4),
            "score_contributions": {
                "rho_pct": round((rho * weights["rho"] * 100) / max(score, 0.01), 1),
                "sigma_pct": round((sigma * weights["sigma"] * 100) / max(score, 0.01), 1),
                "delta_pct": round((delta * weights["delta"] * 100) / max(score, 0.01), 1),
            },
            "metric_percentiles": {
                "rho": round(rho * 100, 1),
                "sigma": round(sigma * 100, 1),
                "delta": round(delta * 100, 1),
            },
        }

    def calculate_state(
        self,
        rho: float,
        sigma: float,
        delta: float,
        persona: str = "commuter",
        location_id: str | None = None,
    ) -> StateResult:
        """Calculate unified state from component metrics.

        Args:
            rho: Density metric (0-1)
            sigma: Sensory metric (0-1)
            delta: Volatility metric (0-1)
            persona: User persona type
            location_id: Optional location identifier for history tracking

        Returns:
            StateResult with score, status, alerts, and recommendations
        """
        start_time = time.perf_counter()

        # Validate and normalize inputs
        rho = min(1.0, max(0.0, rho))
        sigma = min(1.0, max(0.0, sigma))
        delta = min(1.0, max(0.0, delta))

        # Get persona weights
        try:
            persona_enum = Persona(persona.lower())
        except ValueError:
            logger.warning(f"Unknown persona '{persona}', defaulting to commuter")
            persona_enum = Persona.COMMUTER

        weights = self._get_weights(persona_enum)

        # Calculate state score
        score = self._calculate_score(rho, sigma, delta, weights)

        # Classify status
        status = self._classify_status(score)

        # Generate message
        message = self._generate_message(rho, sigma, delta, status)

        # Generate alerts
        alerts = self._generate_alerts(rho, sigma, delta, location_id)

        # Generate recommendations
        recommendations = self._generate_recommendations(rho, sigma, delta, status, persona_enum)

        # Calculate processing time
        processing_time_ms = (time.perf_counter() - start_time) * 1000

        # Generate telemetry
        telemetry = self._generate_telemetry(rho, sigma, delta, score, weights, processing_time_ms)

        return StateResult(
            state_score=score,
            status=status,
            message=message,
            alerts=alerts,
            recommendations=recommendations,
            persona=persona_enum,
            weights=weights,
            raw_scores={"rho": rho, "sigma": sigma, "delta": delta},
            telemetry=telemetry,
        )

    def get_config(self) -> ThresholdConfig:
        """Get current threshold configuration."""
        return self._config

    def update_config(self, **kwargs: float) -> None:
        """Update threshold configuration."""
        self._config.update_thresholds(**kwargs)

    def clear_history(self, location_id: str | None = None) -> None:
        """Clear calculation history for a location or all locations."""
        if location_id:
            self._history.pop(location_id, None)
        else:
            self._history.clear()


# Global engine instance
state_engine = StateEngine()
