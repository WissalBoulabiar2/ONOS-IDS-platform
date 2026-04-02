# SDN Platform - Complete Network Management Suite

[![CI/CD](https://github.com/your-org/sdn-platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/sdn-platform/actions)
[![Coverage](https://codecov.io/gh/your-org/sdn-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/sdn-platform)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A production-ready SDN (Software-Defined Network) management platform built on the ONOS controller with comprehensive web UI, enterprise features, and complete DevOps infrastructure.

## 🚀 Features

### Network Management
- **Real-time Topology Visualization** - Interactive network graph with Cytoscape.js
- **Device Management** - Monitor and manage network devices, ports, and statistics
- **Flow Rules** - View and manage OpenFlow flow rules across devices
- **Intents** - Configure and monitor network intents
- **Alerts & Monitoring** - Real-time alerts and performance metrics

### Enterprise Features
- **Multi-Tenancy** - Complete tenant isolation with RBAC
- **Single Sign-On (SSO)** - OIDC/OAuth2 support (Google, Microsoft, Okta)
- **Role-Based Access Control** - Fine-grained permissions management
- **Audit Logging** - Complete action tracking and compliance
- **Advanced Analytics** - Performance metrics and trend analysis

### Developer Experience
- **REST API** - Comprehensive documented API
- **Rate Limiting** - Intelligent per-endpoint rate limiting
- **Caching** - Multi-level caching strategy (in-memory + Redis)
- **Query Optimization** - Database indexing and optimization
- **Performance Monitoring** - Built-in metrics and health checks

### Infrastructure
- **Container Ready** - Multi-stage Docker builds
- **Kubernetes Support** - Complete Helm/K8s manifests
- **CI/CD Pipeline** - GitHub Actions workflow
- **High Availability** - Database replication and failover
- **Production Ready** - Security hardening and compliance

## 📋 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Next.js** - Server-side rendering and optimization
- **Tailwind CSS** - Utility-first styling
- **Cytoscape.js** - Network topology visualization
- **Recharts** - Data visualization
- **TypeScript** - Type safety

### Backend
- **Node.js 18** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching layer
- **Socket.io** - Real-time communication (optional)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Local development
- **Kubernetes** - Orchestration
- **GitHub Actions** - CI/CD
- **PostgreSQL Replication** - High availability

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (React/Next.js)            │
│  Dashboard │ Topology │ Devices │ Flows │
└────────────────────┬────────────────────┘
                     │ HTTPS/REST
┌────────────────────▼────────────────────┐
│     API Gateway & Middleware Stack      │
│  Rate Limiting │ Auth │ Cache │ Logging │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│       Express Backend (Node.js)         │
│   Controllers │ Services │ Middleware   │
└────────────────────┬────────────────────┘
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼──┐   ┌───▼──┐   ┌───▼──┐
    │ DB   │   │Cache │   │ONOS  │
    │(PG)  │   │Redis │   │API   │
    └──────┘   └──────┘   └──────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (optional)
- ONOS running and accessible

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/sdn-platform
cd sdn-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Services available:
# - Backend: http://localhost:5000
# - Frontend: http://localhost:3000
# - Database: localhost:5432
```

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Architecture Guide](ARCHITECTURE.md)** - System design and components
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Production Checklist](PRODUCTION_CHECKLIST.md)** - Pre-launch verification

## 🔐 Security

### Built-in Security Features
- **JWT Authentication** - Token-based authentication with expiration
- **Password Hashing** - bcrypt with configurable salt rounds
- **HTTPS/TLS** - Encrypted data in transit
- **CORS Configuration** - Origin validation and credentials
- **Rate Limiting** - DDoS protection with endpoint-specific rules
- **Input Sanitization** - XSS protection and input validation
- **Security Headers** - Helmet.js with CSP and HSTS
- **API Key Validation** - Additional API security layer
- **Audit Logging** - Complete action tracking for compliance

### Authentication Methods
- Traditional username/password
- JWT tokens with refresh capability
- SSO with OAuth2/OIDC (Google, Microsoft, Okta)
- Multi-factor authentication (optional)

## 📊 API Endpoints Examples

### Authentication
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login and get JWT token
GET    /api/auth/me               - Get current user
POST   /api/auth/logout           - Logout
```

### Network Management
```
GET    /api/onos/devices          - List all network devices
GET    /api/onos/links            - List network links
GET    /api/onos/flows            - List flow rules
GET    /api/onos/intents          - List network intents
GET    /api/onos/topology         - Get cluster topology
```

### User Management
```
GET    /api/users                 - List all users
GET    /api/users/:id             - Get user by ID
POST   /api/users                 - Create new user (admin)
PUT    /api/users/:id             - Update user
DELETE /api/users/:id             - Delete user (admin)
```

### System
```
GET    /api/health                - Health check
GET    /api/metrics               - System metrics
GET    /api/ready                 - Readiness probe
GET    /api/live                  - Liveness probe
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests with coverage
npm run test:backend

# Frontend tests with coverage
npm run test:frontend

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Current coverage targets: **70%** (lines, branches, functions, statements)

## 📦 Deployment Options

### Local Development
```bash
npm run dev
```

### Docker Compose (Staging)
```bash
docker-compose -f docker-compose.yml up -d
```

### Kubernetes (Production)
```bash
kubectl create namespace sdn-platform
kubectl apply -f k8s/
```

### Environment Variables

See [.env.example](.env.example) for complete configuration. Key variables:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sdn_platform

# ONOS
ONOS_HOST=localhost
ONOS_PORT=8181

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## 🔄 CI/CD Pipeline

Automated with GitHub Actions:

1. **Code Quality** - ESLint, Prettier, Security audit
2. **Testing** - Unit, integration, and frontend tests
3. **Coverage** - Minimum 70% coverage threshold
4. **Scanning** - Trivy vulnerability scanning
5. **Build** - Multi-stage Docker builds
6. **Deploy** - Automatic deployment to staging/production

Pipeline triggers: Push to `main` or `develop` branches, Pull requests

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| API Response (p95) | < 200ms |
| Database Query (avg) | < 50ms |
| Cache Hit Rate | > 80% |
| Uptime | 99.9% |
| Error Rate | < 0.1% |
| Throughput | > 1000 req/sec |

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run dev:debug       # Start with debugging enabled

# Testing
npm run test            # Run all tests
npm run test:watch     # Run tests in watch mode
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run format:check   # Check formatting

# Building
npm run build          # Build for production
npm run build:backend  # Build backend only
npm run build:frontend # Build frontend only

# Database
npm run migrate        # Run database migrations
npm run migrate:undo  # Rollback migrations

# Docker
docker-compose up     # Start all services
docker-compose down   # Stop all services
```

## 📁 Project Structure

```
sdn-platform/
├── PlatformSDN/
│   ├── app/                    # Next.js frontend
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── styles/
│   └── backend/                # Express backend
│       ├── controllers/        # Request handlers
│       ├── services/          # Business logic
│       ├── middleware/        # Express middleware
│       ├── routes/            # API routes
│       ├── migrations/        # DB migrations
│       └── __tests__/         # Test files
├── k8s/                       # Kubernetes manifests
├── .github/
│   └── workflows/             # GitHub Actions
├── docker-compose.yml         # Docker Compose config
├── Dockerfile.backend         # Backend Docker image
├── jest.config.json          # Jest configuration
├── API_DOCUMENTATION.md      # API docs
├── ARCHITECTURE.md           # Architecture guide
├── DEPLOYMENT_GUIDE.md       # Deployment guide
└── PRODUCTION_CHECKLIST.md   # Pre-launch checklist
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

Code must pass:
- ESLint checks
- Prettier formatting
- 70% test coverage
- Security scanning
- All tests passing

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🆘 Support

### Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

### Common Issues
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common problems

### Contact
- Issues: GitHub Issues
- Email: support@sdn-platform.local
- Slack: #sdn-platform

## 🎯 Roadmap

### Phase 1-4 (Completed ✅)
- ✅ Code quality & linting
- ✅ Backend refactoring & modularization
- ✅ Testing framework setup (Jest, 70% coverage)
- ✅ Performance optimization (indexing, caching)

### Phase 5-8 (Completed ✅)
- ✅ Frontend integration with optimized API
- ✅ Documentation (API, architecture, deployment)
- ✅ Enterprise features (multi-tenancy, RBAC, SSO)
- ✅ CI/CD pipeline (GitHub Actions)

### Phase 9-10 (Completed ✅)
- ✅ Docker optimization (multi-stage builds)
- ✅ Kubernetes deployment manifests
- ✅ Integration testing & production readiness
- ✅ Production checklist

### Future Enhancements
- [ ] GraphQL API layer
- [ ] WebSocket real-time updates
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Advanced ML-based analytics
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

## 📊 Statistics

- **Lines of Code**: 15,000+
- **Components**: 50+
- **API Endpoints**: 20+
- **Test Coverage**: 70%+
- **Documentation Pages**: 4
- **Supported Platforms**: Docker, Kubernetes, Bare Metal

---

**Status**: Production Ready 🚀

Last Updated: April 2, 2026

For the latest development status, see: [GitHub Projects](https://github.com/your-org/sdn-platform/projects)
