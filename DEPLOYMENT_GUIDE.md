# SDN Platform - Deployment Guide

## Prerequisites

- Node.js v18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)
- ONOS running and accessible

## Local Development Setup

### 1. Environment Configuration

Create `.env` file:
```bash
cp .env.example .env
```

Configure database and ONOS settings:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sdn_platform
DB_USER=sdnuser
DB_PASSWORD=sdnpass123

# ONOS
ONOS_HOST=localhost
ONOS_PORT=8181
ONOS_USER=karaf
ONOS_PASSWORD=karaf

# Server
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### 2. Database Setup

```bash
# Create database
createdb sdn_platform

# Initialize schema
psql sdn_platform < PlatformSDN/backend/migrations/001_initial_schema.sql

# Or use migration tool
npm run migrate
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Docker Deployment

### Build Docker Image

```bash
docker build -f Dockerfile -t sdn-platform:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

Services:
- **Backend**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Frontend**: http://localhost:3000 (if configured)

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sdn_platform
      POSTGRES_USER: sdnuser
      POSTGRES_PASSWORD: sdnpass123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - NODE_ENV=production
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./PlatformSDN/app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Kubernetes Deployment

### Prerequisites

- kubectl configured
- Kubernetes cluster running

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace sdn-platform

# Apply configurations
kubectl apply -f k8s/configmap.yaml -n sdn-platform
kubectl apply -f k8s/secrets.yaml -n sdn-platform
kubectl apply -f k8s/postgres.yaml -n sdn-platform
kubectl apply -f k8s/deployment.yaml -n sdn-platform

# Verify deployment
kubectl get pods -n sdn-platform
kubectl get services -n sdn-platform
```

### Access Service

```bash
# Port forward
kubectl port-forward svc/sdn-platform 5000:5000 -n sdn-platform

# Service will be at localhost:5000
```

### Scale Application

```bash
kubectl scale deployment sdn-platform --replicas=5 -n sdn-platform
```

## Production Deployment

### Security Checklist

- [ ] Update `JWT_SECRET` to random 32+ character string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable database backups
- [ ] Configure log aggregation

### Performance Optimization

1. **Database Tuning**:
```sql
-- Analyze query performance
ANALYZE;

-- View slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 20;
```

2. **Connection Pool Tuning**:
```bash
DB_POOL_MAX=50
DB_IDLE_TIMEOUT=30000
```

3. **Caching Strategy**:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300 # 5 minutes
```

### Monitoring & Alerting

```bash
# View metrics endpoint
curl http://localhost:5000/api/metrics

# View health status
curl http://localhost:5000/api/health

# View audit logs
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/audit-logs
```

### Backup Strategy

```bash
# Daily database backup
pg_dump sdn_platform > backup_$(date +%Y%m%d).sql

# Restore from backup
psql sdn_platform < backup_20260402.sql
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U sdnuser -d sdn_platform -c "SELECT 1"

# Check connection pool
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/metrics/system
```

### ONOS Integration Issues

```bash
# Test ONOS API
curl -u karaf:karaf http://onos-host:8181/onos/v1/devices

# Check connectivity from backend
curl http://localhost:5000/api/onos/devices
```

### Performance Issues

```bash
# Check slow queries
SELECT query, calls, mean_time, max_time FROM pg_stat_statements
WHERE mean_time > 100 ORDER BY mean_time DESC LIMIT 20;

# View API metrics
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/metrics
```

## Logs

### View Application Logs

```bash
# Docker
docker logs sdn-platform-backend

# Kubernetes
kubectl logs deployment/sdn-platform -n sdn-platform

# File-based (if configured)
tail -f /var/log/sdn-platform/app.log
```

### Enable Debug Logging

```bash
DEBUG=sdn-platform:* npm start
```

## Maintenance

### Database Maintenance

```bash
# Vacuum and analyze
VACUUM ANALYZE;

# Archive old audit logs
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '6 months';

# Reindex tables
REINDEX TABLE users;
REINDEX TABLE audit_logs;
```

### Health Checks

Run periodic health checks:

```bash
# Every 5 minutes
*/5 * * * * curl -f http://localhost:5000/api/health || alert

# Daily backup
0 2 * * * pg_dump sdn_platform | gzip > /backups/sdn_$(date +\%Y\%m\%d).sql.gz
```

## Support

For deployment issues:
1. Check logs: `docker logs` or `kubectl logs`
2. Verify database connectivity
3. Ensure ONOS is running and accessible
4. Review API documentation
5. Contact support team
