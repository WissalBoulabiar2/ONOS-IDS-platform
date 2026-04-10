"""
GET /dashboard/stats     → stats globales         [tous]
GET /dashboard/timeline  → alerts par heure       [tous]
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import CurrentUser
from app.models import AIDetection, Alert, AlertSeverity, AlertStatus, Device, DeviceStatus, FlowRule
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # ── Alerts ────────────────────────────────────────────────
    total_alerts = await db.scalar(select(func.count(Alert.id)))
    open_alerts = await db.scalar(
        select(func.count(Alert.id)).where(Alert.status == AlertStatus.open)
    )
    critical_alerts = await db.scalar(
        select(func.count(Alert.id)).where(Alert.severity == AlertSeverity.critical)
    )

    # ── Alerts par severity ───────────────────────────────────
    severity_rows = await db.execute(
        select(Alert.severity, func.count(Alert.id))
        .group_by(Alert.severity)
    )
    alerts_by_severity = {row[0].value: row[1] for row in severity_rows}

    # S'assure que toutes les severities sont présentes
    for s in ["critical", "high", "medium", "low", "info"]:
        alerts_by_severity.setdefault(s, 0)

    # ── Devices ───────────────────────────────────────────────
    total_devices = await db.scalar(select(func.count(Device.id)))
    active_devices = await db.scalar(
        select(func.count(Device.id)).where(Device.status == DeviceStatus.active)
    )

    # ── Flows ─────────────────────────────────────────────────
    total_flows = await db.scalar(select(func.count(FlowRule.id)))

    # ── AI anomalies dernières 24h ────────────────────────────
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    anomalies_24h = await db.scalar(
        select(func.count(AIDetection.id)).where(
            AIDetection.is_anomaly == True,
            AIDetection.created_at >= since,
        )
    )

    return DashboardStats(
        total_alerts=total_alerts or 0,
        open_alerts=open_alerts or 0,
        critical_alerts=critical_alerts or 0,
        total_devices=total_devices or 0,
        active_devices=active_devices or 0,
        total_flows=total_flows or 0,
        anomalies_24h=anomalies_24h or 0,
        alerts_by_severity=alerts_by_severity,
    )


@router.get("/timeline")
async def get_timeline(
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    hours: int = 24,
):
    """Retourne le nombre d'alerts par heure sur les X dernières heures."""
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    rows = await db.execute(
        select(
            func.date_trunc("hour", Alert.created_at).label("hour"),
            func.count(Alert.id).label("count"),
        )
        .where(Alert.created_at >= since)
        .group_by("hour")
        .order_by("hour")
    )

    return [
        {
            "hour": row.hour.isoformat(),
            "count": row.count,
        }
        for row in rows
    ]