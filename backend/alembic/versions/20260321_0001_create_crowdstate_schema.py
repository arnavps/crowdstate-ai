"""create crowdstate core schema

Revision ID: 20260321_0001
Revises:
Create Date: 2026-03-21 00:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260321_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


location_type_enum = sa.Enum("station", "airport", "venue", name="location_type_enum")
state_status_enum = sa.Enum("NORMAL", "ELEVATED", "CRITICAL", name="state_status_enum")
alert_type_enum = sa.Enum("DENSITY", "SENSORY", "VOLATILITY", name="alert_type_enum")
alert_severity_enum = sa.Enum("WARNING", "DANGER", "CRITICAL", name="alert_severity_enum")
route_type_enum = sa.Enum("FASTEST", "LEAST_CROWDED", "CALMEST", name="route_type_enum")


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb")

    location_type_enum.create(op.get_bind(), checkfirst=True)
    state_status_enum.create(op.get_bind(), checkfirst=True)
    alert_type_enum.create(op.get_bind(), checkfirst=True)
    alert_severity_enum.create(op.get_bind(), checkfirst=True)
    route_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "locations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", location_type_enum, nullable=False),
        sa.Column("area_m2", sa.Float(), nullable=False),
        sa.Column("safe_capacity", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("area_m2 > 0", name="ck_locations_area_m2_positive"),
        sa.CheckConstraint("safe_capacity >= 0", name="ck_locations_safe_capacity_non_negative"),
        sa.CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_locations_latitude_range"),
        sa.CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_locations_longitude_range"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_locations_name", "locations", ["name"], unique=False)

    op.create_table(
        "state_vectors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("location_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("rho", sa.Float(), nullable=False),
        sa.Column("sigma", sa.Float(), nullable=False),
        sa.Column("delta", sa.Float(), nullable=False),
        sa.Column("person_count", sa.Integer(), nullable=False),
        sa.Column("db_level", sa.Float(), nullable=False),
        sa.Column("status", state_status_enum, nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.CheckConstraint("rho >= 0 AND rho <= 1", name="ck_state_vectors_rho_range"),
        sa.CheckConstraint("sigma >= 0 AND sigma <= 1", name="ck_state_vectors_sigma_range"),
        sa.CheckConstraint("delta >= 0 AND delta <= 1", name="ck_state_vectors_delta_range"),
        sa.CheckConstraint("person_count >= 0", name="ck_state_vectors_person_count_non_negative"),
        sa.CheckConstraint("db_level >= 0", name="ck_state_vectors_db_level_non_negative"),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_state_vectors_location_id", "state_vectors", ["location_id"], unique=False)
    op.create_index("ix_state_vectors_timestamp", "state_vectors", ["timestamp"], unique=False)
    op.create_index(
        "ix_state_vectors_location_timestamp",
        "state_vectors",
        ["location_id", "timestamp"],
        unique=False,
    )
    op.execute(
        "SELECT create_hypertable('state_vectors', 'timestamp', if_not_exists => TRUE)"
    )

    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("location_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("alert_type", alert_type_enum, nullable=False),
        sa.Column("severity", alert_severity_enum, nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("acknowledged", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "(acknowledged = false AND acknowledged_at IS NULL) OR "
            "(acknowledged = true AND acknowledged_at IS NOT NULL)",
            name="ck_alerts_acknowledged_timestamp_consistency",
        ),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alerts_location_id", "alerts", ["location_id"], unique=False)
    op.create_index("ix_alerts_timestamp", "alerts", ["timestamp"], unique=False)
    op.create_index("ix_alerts_location_timestamp", "alerts", ["location_id", "timestamp"], unique=False)

    op.create_table(
        "routes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("origin_location_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("destination_location_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("route_type", route_type_enum, nullable=False),
        sa.Column("segments", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("total_score", sa.Float(), nullable=False),
        sa.Column("estimated_duration", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("total_score >= 0", name="ck_routes_total_score_non_negative"),
        sa.CheckConstraint("estimated_duration >= 0", name="ck_routes_estimated_duration_non_negative"),
        sa.CheckConstraint("origin_location_id <> destination_location_id", name="ck_routes_origin_destination_diff"),
        sa.ForeignKeyConstraint(["destination_location_id"], ["locations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["origin_location_id"], ["locations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "origin_location_id",
            "destination_location_id",
            "route_type",
            "created_at",
            name="uq_routes_origin_destination_type_created_at",
        ),
    )
    op.create_index("ix_routes_origin_location_id", "routes", ["origin_location_id"], unique=False)
    op.create_index("ix_routes_destination_location_id", "routes", ["destination_location_id"], unique=False)
    op.create_index("ix_routes_created_at", "routes", ["created_at"], unique=False)
    op.create_index(
        "ix_routes_origin_destination",
        "routes",
        ["origin_location_id", "destination_location_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_routes_origin_destination", table_name="routes")
    op.drop_index("ix_routes_created_at", table_name="routes")
    op.drop_index("ix_routes_destination_location_id", table_name="routes")
    op.drop_index("ix_routes_origin_location_id", table_name="routes")
    op.drop_table("routes")

    op.drop_index("ix_alerts_location_timestamp", table_name="alerts")
    op.drop_index("ix_alerts_timestamp", table_name="alerts")
    op.drop_index("ix_alerts_location_id", table_name="alerts")
    op.drop_table("alerts")

    op.drop_index("ix_state_vectors_location_timestamp", table_name="state_vectors")
    op.drop_index("ix_state_vectors_timestamp", table_name="state_vectors")
    op.drop_index("ix_state_vectors_location_id", table_name="state_vectors")
    op.drop_table("state_vectors")

    op.drop_index("ix_locations_name", table_name="locations")
    op.drop_table("locations")

    route_type_enum.drop(op.get_bind(), checkfirst=True)
    alert_severity_enum.drop(op.get_bind(), checkfirst=True)
    alert_type_enum.drop(op.get_bind(), checkfirst=True)
    state_status_enum.drop(op.get_bind(), checkfirst=True)
    location_type_enum.drop(op.get_bind(), checkfirst=True)
