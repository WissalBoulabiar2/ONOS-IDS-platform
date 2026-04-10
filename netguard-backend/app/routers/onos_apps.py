"""
GET    /onos/apps              → liste des apps ONOS       [tous]
POST   /onos/apps/{name}/activate   → active une app      [admin]
DELETE /onos/apps/{name}/activate   → désactive une app   [admin]
GET    /onos/apps/{name}            → détail app           [tous]
"""

import httpx
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

from app.config import get_settings
from app.deps import CurrentUser, RequireAdmin
from app.models import User

settings = get_settings()
router = APIRouter(prefix="/onos/apps", tags=["onos-apps"])

ONOS_AUTH = None  # défini dynamiquement


def _auth():
    return (settings.ONOS_USER, settings.ONOS_PASSWORD)


@router.get("")
async def list_apps(_: CurrentUser):
    """Liste toutes les applications ONOS avec leur état."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/applications",
                auth=_auth(),
            )
            resp.raise_for_status()
            apps = resp.json().get("applications", [])

            # Enrichit avec des catégories utiles
            categorized = []
            for app in apps:
                categorized.append({
                    "id": app.get("id"),
                    "name": app.get("name"),
                    "version": app.get("version"),
                    "state": app.get("state"),          # ACTIVE / INSTALLED
                    "category": app.get("category"),
                    "description": app.get("description"),
                    "origin": app.get("origin"),
                    "permissions": app.get("permissions", []),
                    "required_apps": app.get("requiredApps", []),
                })
            return {"apps": categorized, "total": len(categorized)}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")


@router.get("/{app_name}")
async def get_app(app_name: str, _: CurrentUser):
    """Détail d'une application ONOS."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/applications/{app_name}",
                auth=_auth(),
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")


@router.post("/{app_name}/activate")
async def activate_app(
    app_name: str,
    _: Annotated[User, RequireAdmin],
):
    """Active une application ONOS. [admin only]"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{settings.ONOS_URL}/onos/v1/applications/{app_name}/active",
                auth=_auth(),
            )
            resp.raise_for_status()
            return {"message": f"App '{app_name}' activée", "status": "ACTIVE"}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")


@router.delete("/{app_name}/activate")
async def deactivate_app(
    app_name: str,
    _: Annotated[User, RequireAdmin],
):
    """Désactive une application ONOS. [admin only]"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.delete(
                f"{settings.ONOS_URL}/onos/v1/applications/{app_name}/active",
                auth=_auth(),
            )
            resp.raise_for_status()
            return {"message": f"App '{app_name}' désactivée", "status": "INSTALLED"}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")