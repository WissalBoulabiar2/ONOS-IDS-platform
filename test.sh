#!/usr/bin/env bash
set -u

ONOS_HOST="${ONOS_HOST:-192.168.30.130}"
ONOS_PORT="${ONOS_PORT:-8181}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-sdnuser}"
DB_NAME="${DB_NAME:-sdn_platform}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_section() {
  printf "\n${YELLOW}%s${NC}\n" "$1"
}

print_ok() {
  printf "${GREEN}[OK] %s${NC}\n" "$1"
}

print_warn() {
  printf "${YELLOW}[WARN] %s${NC}\n" "$1"
}

print_fail() {
  printf "${RED}[FAIL] %s${NC}\n" "$1"
}

echo "SDN Platform quick checks"
echo "========================="

print_section "1. Docker services"
if docker compose ps postgres >/dev/null 2>&1; then
  print_ok "Docker Compose is available"
else
  print_warn "docker compose is not available or not initialized"
fi

print_section "2. PostgreSQL connectivity"
if command -v psql >/dev/null 2>&1; then
  if PGPASSWORD="${DB_PASSWORD:-sdnpass123}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    print_ok "PostgreSQL is reachable"
  else
    print_warn "PostgreSQL is not reachable yet"
  fi
else
  print_warn "psql is not installed, skipping DB check"
fi

print_section "3. Backend health"
if curl -sf "${BACKEND_URL}/api/health" >/dev/null 2>&1; then
  print_ok "Backend health endpoint is reachable"
else
  print_warn "Backend health endpoint is not reachable"
fi

print_section "4. ONOS connectivity"
if curl -sf -u karaf:karaf "http://${ONOS_HOST}:${ONOS_PORT}/onos/v1/version" >/dev/null 2>&1; then
  print_ok "ONOS is reachable at ${ONOS_HOST}:${ONOS_PORT}"
else
  print_warn "ONOS is not reachable at ${ONOS_HOST}:${ONOS_PORT}"
fi

print_section "5. API routes"
if curl -sf "${BACKEND_URL}/api/devices" >/dev/null 2>&1; then
  print_ok "/api/devices"
else
  print_fail "/api/devices"
fi

if curl -sf "${BACKEND_URL}/api/dashboard/stats" >/dev/null 2>&1; then
  print_ok "/api/dashboard/stats"
else
  print_fail "/api/dashboard/stats"
fi

if curl -sf "${BACKEND_URL}/api/topology" >/dev/null 2>&1; then
  print_ok "/api/topology"
else
  print_fail "/api/topology"
fi

print_section "6. Useful URLs"
echo "Frontend:  ${FRONTEND_URL}"
echo "Dashboard: ${FRONTEND_URL}/dashboard"
echo "Devices:   ${FRONTEND_URL}/devices"
echo "Backend:   ${BACKEND_URL}/api/health"
