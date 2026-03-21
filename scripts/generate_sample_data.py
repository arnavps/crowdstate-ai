#!/usr/bin/env python3
"""Generate realistic sample data for CrowdState AI."""

from __future__ import annotations

import argparse
import math
import os
import random
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

from faker import Faker
from sqlalchemy import create_engine, delete, insert, select
from sqlalchemy.orm import Session, sessionmaker

# Make backend package importable when script runs from repo root.
REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import DATABASE_URL, engine  # noqa: E402
from db.models import (  # noqa: E402
    Alert,
    AlertSeverity,
    AlertType,
    Location,
    LocationType,
    StateStatus,
    StateVector,
)


@dataclass(frozen=True)
class LocationSeed:
    name: str
    type: LocationType
    area_m2: float
    safe_capacity: int
    latitude: float
    longitude: float
    pressure_factor: float


LOCATION_SEEDS: tuple[LocationSeed, ...] = (
    LocationSeed(
        name="Mumbai CST Platform 1",
        type=LocationType.STATION,
        area_m2=300.0,
        safe_capacity=450,
        latitude=18.9398,
        longitude=72.8355,
        pressure_factor=1.08,
    ),
    LocationSeed(
        name="London King's Cross Main Hall",
        type=LocationType.STATION,
        area_m2=800.0,
        safe_capacity=1200,
        latitude=51.5308,
        longitude=-0.1238,
        pressure_factor=1.0,
    ),
    LocationSeed(
        name="Tokyo Shibuya Crossing",
        type=LocationType.VENUE,
        area_m2=2500.0,
        safe_capacity=3000,
        latitude=35.6595,
        longitude=139.7005,
        pressure_factor=1.12,
    ),
    LocationSeed(
        name="NYC Grand Central Terminal",
        type=LocationType.STATION,
        area_m2=4200.0,
        safe_capacity=5000,
        latitude=40.7527,
        longitude=-73.9772,
        pressure_factor=0.95,
    ),
    LocationSeed(
        name="Seoul Itaewon District",
        type=LocationType.VENUE,
        area_m2=1500.0,
        safe_capacity=1800,
        latitude=37.5345,
        longitude=126.9946,
        pressure_factor=1.04,
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate CrowdState AI sample data.")
    parser.add_argument("--days", type=int, default=7, help="How many past days to generate.")
    parser.add_argument(
        "--step-seconds",
        type=int,
        default=5,
        help="Sampling interval in seconds. Default is 5 seconds.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for deterministic generation.",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Delete existing alerts/state_vectors before inserting generated rows.",
    )
    return parser.parse_args()


def ensure_locations(session: Session) -> dict[str, Location]:
    existing = {
        row.name: row
        for row in session.scalars(select(Location).where(Location.name.in_([s.name for s in LOCATION_SEEDS])))
    }
    for seed in LOCATION_SEEDS:
        location = existing.get(seed.name)
        if location is None:
            location = Location(
                id=uuid.uuid4(),
                name=seed.name,
                type=seed.type,
                area_m2=seed.area_m2,
                safe_capacity=seed.safe_capacity,
                latitude=seed.latitude,
                longitude=seed.longitude,
            )
            session.add(location)
            existing[seed.name] = location
        else:
            location.type = seed.type
            location.area_m2 = seed.area_m2
            location.safe_capacity = seed.safe_capacity
            location.latitude = seed.latitude
            location.longitude = seed.longitude
    session.commit()

    refreshed = {
        row.name: row
        for row in session.scalars(select(Location).where(Location.name.in_([s.name for s in LOCATION_SEEDS])))
    }
    return refreshed


def choose_status(ts: datetime, rng: random.Random, pressure_factor: float) -> StateStatus:
    normal, elevated, critical = 0.70, 0.25, 0.05
    hour = ts.hour
    weekday = ts.weekday()

    if 7 <= hour <= 10 or 17 <= hour <= 21:
        normal -= 0.12
        elevated += 0.09
        critical += 0.03
    elif 0 <= hour <= 5:
        normal += 0.11
        elevated -= 0.08
        critical -= 0.03

    if weekday >= 5:
        elevated += 0.03
        critical += 0.01
        normal -= 0.04

    elevated += (pressure_factor - 1.0) * 0.08
    critical += (pressure_factor - 1.0) * 0.03
    normal = 1.0 - elevated - critical

    normal = max(0.05, min(normal, 0.92))
    elevated = max(0.03, min(elevated, 0.70))
    critical = max(0.01, min(critical, 0.25))
    total = normal + elevated + critical
    normal, elevated, critical = normal / total, elevated / total, critical / total

    roll = rng.random()
    if roll <= normal:
        return StateStatus.NORMAL
    if roll <= normal + elevated:
        return StateStatus.ELEVATED
    return StateStatus.CRITICAL


def generate_metrics(
    status: StateStatus,
    ts: datetime,
    safe_capacity: int,
    pressure_factor: float,
    rng: random.Random,
) -> tuple[float, float, float, int, float, bool]:
    hour = ts.hour + ts.minute / 60.0
    circadian = 0.5 + 0.5 * math.sin((hour - 6) * math.pi / 12)
    circadian *= pressure_factor
    spike = rng.random() < 0.0025

    if status is StateStatus.NORMAL:
        rho = rng.uniform(0.16, 0.52)
        sigma = rng.uniform(0.18, 0.54)
        delta = rng.uniform(0.04, 0.34)
    elif status is StateStatus.ELEVATED:
        rho = rng.uniform(0.48, 0.78)
        sigma = rng.uniform(0.50, 0.80)
        delta = rng.uniform(0.24, 0.68)
    else:
        rho = rng.uniform(0.78, 0.98)
        sigma = rng.uniform(0.78, 0.98)
        delta = rng.uniform(0.65, 0.98)

    rho = min(1.0, max(0.0, rho + (circadian - 0.5) * 0.22 + rng.uniform(-0.04, 0.04)))
    sigma = min(1.0, max(0.0, sigma + (circadian - 0.5) * 0.17 + rng.uniform(-0.04, 0.04)))
    delta = min(1.0, max(0.0, delta + (circadian - 0.5) * 0.10 + rng.uniform(-0.03, 0.03)))

    if spike:
        rho = min(1.0, rho + rng.uniform(0.12, 0.22))
        sigma = min(1.0, sigma + rng.uniform(0.10, 0.20))
        delta = min(1.0, delta + rng.uniform(0.15, 0.25))

    person_count = int(max(0, round(rho * safe_capacity * rng.uniform(0.88, 1.18))))
    db_level = max(35.0, 42.0 + sigma * 55 + rng.uniform(-4.0, 4.0))
    return rho, sigma, delta, person_count, db_level, spike


def severity_for_metric(value: float) -> AlertSeverity:
    if value >= 0.90:
        return AlertSeverity.CRITICAL
    if value >= 0.75:
        return AlertSeverity.DANGER
    return AlertSeverity.WARNING


def build_alert_message(
    alert_type: AlertType,
    severity: AlertSeverity,
    location_name: str,
    value: float,
    faker: Faker,
) -> str:
    metric_name = {
        AlertType.DENSITY: "crowd density",
        AlertType.SENSORY: "sensory load",
        AlertType.VOLATILITY: "movement volatility",
    }[alert_type]
    action = {
        AlertSeverity.WARNING: "Monitor and prepare mitigation.",
        AlertSeverity.DANGER: "Dispatch ground staff to decongest flow.",
        AlertSeverity.CRITICAL: "Activate emergency routing and escalation.",
    }[severity]
    return (
        f"{severity.value}: {metric_name} at {location_name} reached {value:.2f}. "
        f"{action} Note: {faker.bs()}."
    )


def main() -> None:
    args = parse_args()
    if args.days <= 0:
        raise ValueError("--days must be > 0")
    if args.step_seconds <= 0:
        raise ValueError("--step-seconds must be > 0")

    rng = random.Random(args.seed)
    faker = Faker()
    Faker.seed(args.seed)

    db_url = os.getenv("DATABASE_URL", DATABASE_URL)
    local_engine = engine if db_url == DATABASE_URL else create_engine(db_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=local_engine, autoflush=False, autocommit=False)

    end_ts = datetime.now(timezone.utc).replace(microsecond=0)
    start_ts = end_ts - timedelta(days=args.days)
    interval = timedelta(seconds=args.step_seconds)
    expected_points_per_location = int(((end_ts - start_ts).total_seconds() // args.step_seconds) + 1)
    expected_total = expected_points_per_location * len(LOCATION_SEEDS)

    print(f"Using DATABASE_URL={db_url}")
    print(f"Generating ~{expected_total:,} state vectors ({expected_points_per_location:,} per location)")

    with SessionLocal() as session:
        locations = ensure_locations(session)
        ordered_locations = [(seed, locations[seed.name]) for seed in LOCATION_SEEDS]

        if args.truncate:
            print("Truncating existing alerts and state_vectors...")
            session.execute(delete(Alert))
            session.execute(delete(StateVector))
            session.commit()

        state_rows: list[dict] = []
        alert_rows: list[dict] = []
        state_batch_size = 5000
        alert_batch_size = 2000
        inserted_state = 0
        inserted_alerts = 0

        status_count = {
            StateStatus.NORMAL: 0,
            StateStatus.ELEVATED: 0,
            StateStatus.CRITICAL: 0,
        }
        last_alert_ts: dict[tuple[uuid.UUID, AlertType], datetime] = {}
        alert_cooldown = timedelta(minutes=10)
        critical_cooldown = timedelta(minutes=3)

        current = start_ts
        tick = 0
        while current <= end_ts:
            tick += 1
            for seed, location in ordered_locations:
                status = choose_status(current, rng, seed.pressure_factor)
                rho, sigma, delta, person_count, db_level, had_spike = generate_metrics(
                    status=status,
                    ts=current,
                    safe_capacity=seed.safe_capacity,
                    pressure_factor=seed.pressure_factor,
                    rng=rng,
                )

                # Escalate status when spikes force very high stress values.
                if had_spike and max(rho, sigma, delta) > 0.90:
                    status = StateStatus.CRITICAL
                elif status is StateStatus.NORMAL and (rho > 0.70 or sigma > 0.72 or delta > 0.70):
                    status = StateStatus.ELEVATED

                status_count[status] += 1
                state_rows.append(
                    {
                        "id": uuid.uuid4(),
                        "location_id": location.id,
                        "timestamp": current,
                        "rho": rho,
                        "sigma": sigma,
                        "delta": delta,
                        "person_count": person_count,
                        "db_level": round(db_level, 2),
                        "status": status.value,
                        "metadata": {
                            "source": "simulator",
                            "spike_detected": had_spike,
                            "quality_flag": rng.choice(["high", "medium", "high", "high"]),
                            "camera_zone": faker.lexify("Zone-??").upper(),
                        },
                    }
                )

                thresholds = (
                    (AlertType.DENSITY, rho, 0.68),
                    (AlertType.SENSORY, sigma, 0.70),
                    (AlertType.VOLATILITY, delta, 0.65),
                )
                for alert_type, value, threshold in thresholds:
                    if value < threshold:
                        continue
                    sev = severity_for_metric(value)
                    cooldown = critical_cooldown if sev is AlertSeverity.CRITICAL else alert_cooldown
                    key = (location.id, alert_type)
                    last_ts = last_alert_ts.get(key)
                    if last_ts and (current - last_ts) < cooldown:
                        continue
                    last_alert_ts[key] = current
                    alert_rows.append(
                        {
                            "id": uuid.uuid4(),
                            "location_id": location.id,
                            "timestamp": current,
                            "alert_type": alert_type.value,
                            "severity": sev.value,
                            "message": build_alert_message(
                                alert_type=alert_type,
                                severity=sev,
                                location_name=location.name,
                                value=value,
                                faker=faker,
                            ),
                            "acknowledged": False,
                            "acknowledged_at": None,
                        }
                    )

            if len(state_rows) >= state_batch_size:
                session.execute(insert(StateVector.__table__), state_rows)
                session.commit()
                inserted_state += len(state_rows)
                state_rows.clear()

            if len(alert_rows) >= alert_batch_size:
                session.execute(insert(Alert.__table__), alert_rows)
                session.commit()
                inserted_alerts += len(alert_rows)
                alert_rows.clear()

            if tick % 10000 == 0:
                print(
                    f"Progress: {current.isoformat()} | state_vectors={inserted_state:,} alerts={inserted_alerts:,}"
                )

            current += interval

        if state_rows:
            session.execute(insert(StateVector.__table__), state_rows)
            session.commit()
            inserted_state += len(state_rows)

        if alert_rows:
            session.execute(insert(Alert.__table__), alert_rows)
            session.commit()
            inserted_alerts += len(alert_rows)

        total_status = sum(status_count.values())
        normal_pct = (status_count[StateStatus.NORMAL] / total_status) * 100
        elevated_pct = (status_count[StateStatus.ELEVATED] / total_status) * 100
        critical_pct = (status_count[StateStatus.CRITICAL] / total_status) * 100

        print("Generation complete.")
        print(f"Inserted locations: {len(ordered_locations)}")
        print(f"Inserted state_vectors: {inserted_state:,}")
        print(f"Inserted alerts: {inserted_alerts:,}")
        print(
            "Status distribution: "
            f"NORMAL={normal_pct:.2f}% ELEVATED={elevated_pct:.2f}% CRITICAL={critical_pct:.2f}%"
        )


if __name__ == "__main__":
    main()
