# SDN Platform Setup Guide

## Overview

The project can run in two modes:

1. ONOS bridge only
   The backend talks directly to ONOS and the frontend reads live data from the backend.

2. ONOS + PostgreSQL cache
   The backend can also store synchronized devices, ports, topology, flows, and history in PostgreSQL.

The backend is now resilient:

- if PostgreSQL is unavailable, live ONOS routes still work
- if PostgreSQL is available, dashboard and metrics routes can use cached data

## Prerequisites

- Node.js 18+
- npm
- ONOS running and reachable from your machine
- Optional: Docker Desktop for PostgreSQL and pgAdmin

## Architecture

```text
Frontend (Next.js)
        |
        v
Backend API (Express)
        |
        +--> ONOS REST API
        |
        +--> PostgreSQL (optional cache + history)
```

## 1. Install dependencies

From the `PlatformSDN` folder:

```bash
npm install --legacy-peer-deps
```

## 2. Configure the backend

Edit `PlatformSDN/backend/.env`:

```env
ONOS_HOST=192.168.30.130
ONOS_PORT=8181
ONOS_USER=karaf
ONOS_PASSWORD=karaf

PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=sdnuser
DB_PASSWORD=sdnpass123
DB_NAME=sdn_platform

ENABLE_AUTO_SYNC=false
SYNC_INTERVAL_MS=5000
```

Notes:

- Replace `ONOS_HOST` with your VM IP if needed.
- Keep `ENABLE_AUTO_SYNC=false` if you only want live ONOS access without database sync.
- Enable auto-sync only after PostgreSQL is initialized.

## 3. Optional database setup

From the repository root:

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- pgAdmin on `http://localhost:5050`

Default pgAdmin credentials:

- Email: `admin@sdn.local`
- Password: `admin123`

The schema is initialized from `init-db.sql`.

## 4. Start the backend

From the `PlatformSDN` folder:

```bash
npm run backend
```

Useful endpoints:

- `http://localhost:5000/api/health`
- `http://localhost:5000/api/devices`
- `http://localhost:5000/api/topology`
- `http://localhost:5000/api/flows`
- `http://localhost:5000/api/dashboard/stats`

## 5. Start the frontend

From the `PlatformSDN` folder in a second terminal:

```bash
npm run dev
```

Main routes:

- `http://localhost:3000/`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/devices`
- `http://localhost:3000/topology`
- `http://localhost:3000/flows`
- `http://localhost:3000/alerts`

## 6. Recommended bring-up order

1. Verify ONOS is reachable from Windows.
2. Start the backend and test `/api/health`.
3. Start the frontend and verify `/devices`.
4. If you want cached metrics/history, start PostgreSQL.
5. Set `ENABLE_AUTO_SYNC=true` and restart the backend.

## Troubleshooting

### Backend works but PostgreSQL is down

This is expected now. The backend should stay up and fall back to ONOS live data.

### `/api/health` says `DEGRADED`

This means:

- ONOS is reachable
- PostgreSQL is not ready while auto-sync is enabled

### ONOS returns `403 Forbidden` on `/`

That does not necessarily mean ONOS is broken. Test a real ONOS route such as:

```bash
curl -u karaf:karaf http://<ONOS_HOST>:8181/onos/v1/devices
```

### Frontend shows stale or broken chunks

Delete the local `.next` cache and restart `npm run dev`.

## What is stored in PostgreSQL

- `devices`
- `ports`
- `port_metrics`
- `topology_links`
- `flows`
- `device_metrics`
- `sync_log`
- `alerts`

## Current status

- Frontend pages are in place for dashboard, topology, devices, flows, alerts, and configuration.
- Backend routes work directly with ONOS.
- PostgreSQL is optional but ready for sync and dashboard caching.
