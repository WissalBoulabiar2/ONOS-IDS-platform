import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.deps import CurrentUser, RequireAdminOrManager
from app.models import Device, User
from typing import Annotated
settings = get_settings()
router = APIRouter(prefix="/topology", tags=["topology"])


@router.get("")
async def get_topology(
    _: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            devices_resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/devices",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
            )
            links_resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/links",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
            )
            hosts_resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/hosts",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
            )
            devices_resp.raise_for_status()
            links_resp.raise_for_status()

    except httpx.HTTPError:
        result = await db.execute(select(Device))
        devices = result.scalars().all()
        return {
            "nodes": [
                {
                    "id": d.onos_id or str(d.id),
                    "label": d.name,
                    "type": d.type or "SWITCH",
                    "status": d.status,
                    "manufacturer": d.manufacturer,
                    "sw_version": d.sw_version,
                }
                for d in devices
            ],
            "edges": [],
            "hosts": [],
            "source": "db_fallback",
        }

    onos_devices = devices_resp.json().get("devices", [])
    onos_links = links_resp.json().get("links", [])
    onos_hosts = hosts_resp.json().get("hosts", []) if hosts_resp.status_code == 200 else []

    nodes = [
        {
            "id": d["id"],
            "label": d.get("annotations", {}).get("name", d["id"]),
            "type": d.get("type", "SWITCH"),
            "status": "active" if d.get("available") else "inactive",
            "manufacturer": d.get("mfr"),
            "hw_version": d.get("hw"),
            "sw_version": d.get("sw"),
            "serial": d.get("serial"),
            "ports_count": len(d.get("ports", [])),
        }
        for d in onos_devices
    ]

    edges = [
        {
            "id": f"{lnk['src']['device']}-{lnk['src']['port']}-{lnk['dst']['device']}-{lnk['dst']['port']}",
            "source": lnk["src"]["device"],
            "source_port": lnk["src"]["port"],
            "target": lnk["dst"]["device"],
            "target_port": lnk["dst"]["port"],
            "type": lnk.get("type", "DIRECT"),
            "state": lnk.get("state", "ACTIVE"),
        }
        for lnk in onos_links
    ]

    hosts = [
        {
            "id": h.get("id"),
            "mac": h.get("mac"),
            "ip": h.get("ipAddresses", [None])[0],
            "location_device": (
                h.get("locations", [{}])[0].get("elementId")
                if h.get("locations")
                else h.get("location", {}).get("elementId")
            ),
            "location_port": (
                h.get("locations", [{}])[0].get("port")
                if h.get("locations")
                else h.get("location", {}).get("port")
            ),
            "vlan": h.get("vlan"),
        }
        for h in onos_hosts
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "hosts": hosts,
        "source": "onos_live",
    }


@router.get("/hosts")
async def get_hosts(_: CurrentUser):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/hosts",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
            )
            resp.raise_for_status()
            return resp.json().get("hosts", [])
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")

@router.get("/stats/ports")
async def get_port_stats(_: CurrentUser):
    """Statistiques des ports (telemetry) depuis ONOS."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/statistics/ports",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
            )
            resp.raise_for_status()
            stats = resp.json().get("statistics", [])

            # Enrichit avec utilization calculée
            result = []
            for device_stats in stats:
                device_id = device_stats.get("device")
                ports = []
                for p in device_stats.get("ports", []):
                    total_bytes = p.get("bytesReceived", 0) + p.get("bytesSent", 0)
                    duration = max(p.get("durationSec", 1), 1)
                    throughput = total_bytes / duration  # bytes/sec
                    # Utilization simulée (10Gbps link)
                    link_capacity = 10_000_000_000 / 8  # 10Gbps en bytes/sec
                    utilization = min(round((throughput / link_capacity) * 100, 2), 100)

                    ports.append({
                        "port": str(p.get("port")),
                        "packetsReceived": p.get("packetsReceived", 0),
                        "packetsSent": p.get("packetsSent", 0),
                        "bytesReceived": p.get("bytesReceived", 0),
                        "bytesSent": p.get("bytesSent", 0),
                        "throughput_bps": round(throughput, 2),
                        "utilization": utilization,
                        "live": True,
                    })
                result.append({
                    "device": device_id,
                    "ports": ports,
                })
            return {"statistics": result}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")


@router.get("/paths/{src}/{dst}")
async def get_path(
    src: str,
    dst: str,
    _: CurrentUser,
):
    """Calcule le chemin ONOS entre deux devices."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.ONOS_URL}/onos/v1/paths/{src}/{dst}",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
            )
            resp.raise_for_status()
            data = resp.json()
            paths = data.get("paths", [])

            if not paths:
                return {"paths": [], "found": False}

            best = paths[0]
            links = best.get("links", [])

            # Extrait les nodes du chemin
            path_nodes = []
            for link in links:
                src_dev = link["src"]["device"]
                if src_dev not in path_nodes:
                    path_nodes.append(src_dev)
            if links:
                path_nodes.append(links[-1]["dst"]["device"])

            # Edge refs
            edge_refs = [
                f"{lnk['src']['device']}-{lnk['src']['port']}-{lnk['dst']['device']}-{lnk['dst']['port']}"
                for lnk in links
            ]

            return {
                "found": True,
                "cost": best.get("cost", 0),
                "paths": [{
                    "nodes": path_nodes,
                    "edge_refs": edge_refs,
                    "links": links,
                    "summary": f"{len(links)} hop{'s' if len(links) > 1 else ''}",
                }],
            }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")


@router.delete("/links")
async def delete_link(
    body: dict,
    _: Annotated[User, RequireAdminOrManager],
):
    """Supprime un lien dans ONOS."""
    src_device = body.get("src_device")
    src_port = body.get("src_port")
    dst_device = body.get("dst_device")
    dst_port = body.get("dst_port")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.delete(
                f"{settings.ONOS_URL}/onos/v1/links",
                auth=(settings.ONOS_USER, settings.ONOS_PASSWORD),
                params={
                    "device": src_device,
                    "port": src_port,
                },
            )
            return {
                "message": "Link removal requested",
                "status": resp.status_code,
            }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"ONOS inaccessible: {e}")