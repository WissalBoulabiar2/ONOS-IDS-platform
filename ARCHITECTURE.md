# SDN Platform - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer (React)                 │
│  Dashboard │ Topology │ Devices │ Flows │ Analytics         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST
┌────────────────────────▼────────────────────────────────────┐
│                    API Gateway / LB                         │
│  (Rate Limiting, Auth, CORS, Request Logging)              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Express Backend (Node.js)                  │
│                                                             │
│   ┌──────────────────────────────────────────────────┐     │
│   │                 Controllers                       │     │
│   │  Auth │ ONOS │ Users │ Alerts │ Health          │     │
│   └──────────────────────────────────────────────────┘     │
│                        │                                    │
│   ┌──────────────────────────────────────────────────┐     │
│   │                Services Layer                    │     │
│   │  Auth │ ONOS │ Audit │ Metrics │ Cache │Query   │     │
│   └──────────────────────────────────────────────────┘     │
│                        │                                    │
│   ┌──────────────────────────────────────────────────┐     │
│   │              Middleware Stack                    │     │
│   │  Auth │ RateLimit │ Security │ Cache │ Perf      │     │
│   └──────────────────────────────────────────────────┘     │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐  ┌───▼──────────┐  ┌──▼──────────┐
│  PostgreSQL    │  │   Redis      │  │   ONOS      │
│  (Main DB)     │  │   (Cache)    │  │ (Network)   │
│                │  │              │  │             │
│ - Users        │  │ - Sessions   │  │ - Devices   │
│ - Audit Logs   │  │ - API Cache  │  │ - Links     │
│ - Alerts       │  │ - Rate Limit │  │ - Flows     │
│ - Metrics      │  │              │  │ - Intents   │
└────────────────┘  └──────────────┘  │             │
                                       └─────────────┘
```

## Component Responsibilities

### Controllers
- Request handling and validation
- Response formatting
- Error handling and status codes
- Audit logging triggering

### Services
- Business logic implementation
- Database operations
- External API calls (ONOS)
- Caching logic
- Authentication/Authorization

### Middleware
- Authentication verification
- Rate limiting enforcement
- Security headers injection
- Request/Response logging
- Performance monitoring

### Database Layer
- Connection pooling
- Query execution with optimization
- Transaction management
- Index utilization

## Data Flow Example: Device Retrieval

```
1. Client Request
   GET /api/onos/devices (with JWT token)
        │
2. Express Router
   Routes request to controller
        │
3. Authentication Middleware
   Verifies JWT token, attaches user to request
        │
4. Rate Limiting Middleware
   Checks rate limit, updates counter
        │
5. OnosController.getDevices()
   - Start performance tracking
   - Call OnosService.getDevices()
        │
6. OnosService
   - Check cache first
   - If cache miss, call ONOS REST API
   - Cache result with TTL
        │
7. MetricsService
   - Record API call duration and status
        │
8. AuditService
   - Log the action with user/IP/details
        │
9. Response
   - 200 OK with device list and cache headers
   - Include rate limit info in headers
```

## Database Schema

### Core Tables

**users**
- id (PK)
- username, email, password_hash
- full_name, role, is_active
- last_login, created_at, updated_at
- Indexes: username, email, role

**audit_logs**
- id (PK)
- user_id (FK)
- action, resource, resource_id, status
- details (JSONB), ip_address, user_agent
- created_at
- Indexes: user_id, action, created_at

**alerts**
- id (PK)
- title, description, severity, status
- source, resource_id, resource_type
- triggered_at, resolved_at, created_at
- Indexes: severity, status, triggered_at

**metrics_snapshots**
- id (PK)
- metric_type, metric_name, metric_value
- tags (JSONB)
- created_at
- Indexes: metric_type, created_at

**tenants** (Multi-tenancy)
- id (PK)
- name (UNIQUE), slug (UNIQUE)
- description, config (JSONB)
- is_active, created_at, updated_at

**user_tenants**
- user_id (FK), tenant_id (FK)
- role, created_at
- UNIQUE(user_id, tenant_id)

## Caching Strategy

```
Level 1: In-Memory Cache (Node.js)
├─ API Response Cache (LRU, TTL: 5 min)
├─ Device/Link Cache (TTL: 1 min)
└─ User Cache (TTL: 30 min)
       │
Level 2: Redis (Distributed)
├─ Session data
├─ Rate limit counters
└─ Shared cache for multi-instance
       │
Level 3: Database (Persistent)
├─ All persistent data
└─ Cache invalidation through UPDATE
```

## Security Architecture

```
External Request
       │
       ▼
┌──────────────────────┐
│  TLS/HTTPS (1.2+)    │ - Encryption in transit
├──────────────────────┤
│  CORS Validation     │ - Origin verification
├──────────────────────┤
│  Rate Limiting       │ - DDoS mitigation
├──────────────────────┤
│  JWT Validation      │ - Authentication
├──────────────────────┤
│  Role Verification   │ - Authorization
├──────────────────────┤
│  Input Sanitization  │ - XSS/Injection prevention
├──────────────────────┤
│  Audit Logging       │ - Activity tracking
└──────────────────────┘
       │
       ▼
  Protected Resource
```

## Rate Limiting Algorithm

```
Per Key (IP:User:Path):

├─ Endpoint-specific limits:
│  ├─ /auth/login: 5 req/15min
│  ├─ /auth/register: 3 req/1hr
│  ├─ /onos/*: 100 req/1min
│  └─ Default: 1000 req/1min
│
├─ Sliding window counter
│  ├─ Track request timestamps
│  └─ Remove expired entries
│
└─ Responses:
   ├─ 200 OK: Within limit
   ├─ 429 Too Many Requests: Exceeded
   └─ Headers: X-RateLimit-*, Retry-After
```

## Error Handling Strategy

```
Request Error
     │
     ▼
Validation Error?  ──Yes──> 400 Bad Request
     │ No
     ▼
Authentication Error?  ──Yes──> 401 Unauthorized
     │ No
     ▼
Authorization Error?  ──Yes──> 403 Forbidden
     │ No
     ▼
Resource Not Found?  ──Yes──> 404 Not Found
     │ No
     ▼
Public API Error (ONOS)?  ──Yes──> 502 Bad Gateway
     │ No
     ▼
Server Error?  ──Yes──> 500 Internal Server Error
     │ No
     ▼
Service Down?  ──Yes──> 503 Service Unavailable
     │ No
     ▼
200 OK
```

## Deployment Patterns

### Development
- Single Node.js process
- SQLite or local PostgreSQL
- No caching layer
- Verbose logging

### Staging
- 2-3 Node.js instances (Docker)
- PostgreSQL with replication
- Redis for caching
- Moderate monitoring

### Production
- 5+ Node.js instances (Kubernetes)
- PostgreSQL HA with failover
- Redis cluster
- Full monitoring and alerting
- CDN for static assets
- Dedicated monitoring/logging infrastructure

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Database Query Time (avg) | < 50ms |
| Cache Hit Rate | > 80% |
| Availability | 99.9% |
| Error Rate | < 0.1% |
| Throughput | > 1000 req/sec |

## Monitoring & Observability

```
Application
    ├─ Metrics: Prometheus
    ├─ Logs: ELK Stack
    ├─ Traces: Jaeger
    └─ Health: Custom endpoints

Database
    ├─ Query Performance
    ├─ Connection Pool Stats
    ├─ Slow Query Log
    └─ Replication Lag

Infrastructure
    ├─ CPU, Memory, Disk
    ├─ Network I/O
    ├─ Kubernetes metrics
    └─ Pod restart history
```

## Future Enhancements

1. **GraphQL API** - For flexible queries
2. **WebSocket Support** - Real-time updates
3. **Message Queue** - Async operations
4. **Multi-tenancy** - Complete isolation
5. **SSO Integration** - Enterprise auth
6. **Advanced Analytics** - ML-based insights
7. **API Versioning** - Backward compatibility
8. **Dynamic Configuration** - Without restart
