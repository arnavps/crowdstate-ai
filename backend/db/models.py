import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class LocationType(str, enum.Enum):
    STATION = "station"
    AIRPORT = "airport"
    VENUE = "venue"


class StateStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    ELEVATED = "ELEVATED"
    CRITICAL = "CRITICAL"


class AlertType(str, enum.Enum):
    DENSITY = "DENSITY"
    SENSORY = "SENSORY"
    VOLATILITY = "VOLATILITY"


class AlertSeverity(str, enum.Enum):
    WARNING = "WARNING"
    DANGER = "DANGER"
    CRITICAL = "CRITICAL"


class RouteType(str, enum.Enum):
    FASTEST = "FASTEST"
    LEAST_CROWDED = "LEAST_CROWDED"
    CALMEST = "CALMEST"


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        CheckConstraint("area_m2 > 0", name="ck_locations_area_m2_positive"),
        CheckConstraint("safe_capacity >= 0", name="ck_locations_safe_capacity_non_negative"),
        CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_locations_latitude_range"),
        CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_locations_longitude_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[LocationType] = mapped_column(
        Enum(LocationType, name="location_type_enum"),
        nullable=False,
    )
    area_m2: Mapped[float] = mapped_column(Float, nullable=False)
    safe_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    state_vectors: Mapped[list["StateVector"]] = relationship(
        back_populates="location", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(back_populates="location", cascade="all, delete-orphan")
    origin_routes: Mapped[list["Route"]] = relationship(
        back_populates="origin_location",
        foreign_keys="Route.origin_location_id",
        cascade="all, delete-orphan",
    )
    destination_routes: Mapped[list["Route"]] = relationship(
        back_populates="destination_location",
        foreign_keys="Route.destination_location_id",
        cascade="all, delete-orphan",
    )


class StateVector(Base):
    __tablename__ = "state_vectors"
    __table_args__ = (
        CheckConstraint("rho >= 0 AND rho <= 1", name="ck_state_vectors_rho_range"),
        CheckConstraint("sigma >= 0 AND sigma <= 1", name="ck_state_vectors_sigma_range"),
        CheckConstraint("delta >= 0 AND delta <= 1", name="ck_state_vectors_delta_range"),
        CheckConstraint("person_count >= 0", name="ck_state_vectors_person_count_non_negative"),
        CheckConstraint("db_level >= 0", name="ck_state_vectors_db_level_non_negative"),
        Index("ix_state_vectors_location_timestamp", "location_id", "timestamp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    rho: Mapped[float] = mapped_column(Float, nullable=False)
    sigma: Mapped[float] = mapped_column(Float, nullable=False)
    delta: Mapped[float] = mapped_column(Float, nullable=False)
    person_count: Mapped[int] = mapped_column(Integer, nullable=False)
    db_level: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[StateStatus] = mapped_column(
        Enum(StateStatus, name="state_status_enum"),
        nullable=False,
    )
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)

    location: Mapped["Location"] = relationship(back_populates="state_vectors")


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alerts_location_timestamp", "location_id", "timestamp"),
        CheckConstraint(
            "(acknowledged = false AND acknowledged_at IS NULL) OR "
            "(acknowledged = true AND acknowledged_at IS NOT NULL)",
            name="ck_alerts_acknowledged_timestamp_consistency",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    alert_type: Mapped[AlertType] = mapped_column(
        Enum(AlertType, name="alert_type_enum"),
        nullable=False,
    )
    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="alert_severity_enum"),
        nullable=False,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    acknowledged: Mapped[bool] = mapped_column(nullable=False, default=False, server_default="false")
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    location: Mapped["Location"] = relationship(back_populates="alerts")


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (
        CheckConstraint("total_score >= 0", name="ck_routes_total_score_non_negative"),
        CheckConstraint("estimated_duration >= 0", name="ck_routes_estimated_duration_non_negative"),
        CheckConstraint("origin_location_id <> destination_location_id", name="ck_routes_origin_destination_diff"),
        UniqueConstraint(
            "origin_location_id",
            "destination_location_id",
            "route_type",
            "created_at",
            name="uq_routes_origin_destination_type_created_at",
        ),
        Index("ix_routes_origin_destination", "origin_location_id", "destination_location_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin_location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    destination_location_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    route_type: Mapped[RouteType] = mapped_column(
        Enum(RouteType, name="route_type_enum"),
        nullable=False,
    )
    segments: Mapped[list[dict]] = mapped_column(JSONB, nullable=False)
    total_score: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )

    origin_location: Mapped["Location"] = relationship(
        back_populates="origin_routes", foreign_keys=[origin_location_id]
    )
    destination_location: Mapped["Location"] = relationship(
        back_populates="destination_routes", foreign_keys=[destination_location_id]
    )
