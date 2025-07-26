
# Feedback System - Microservices Architecture

## Overview

This project has been migrated from a monolithic React application to a microservices architecture while maintaining the existing Supabase database as the shared data layer.

## Architecture

### Services

1. **API Gateway** (Port 3000) - Request routing, rate limiting, and load balancing
2. **Auth Service** (Port 3001) - Authentication, authorization, and user management
3. **Organization Service** (Port 3002) - Organization management, users, and permissions
4. **Feedback Service** (Port 3003) - Question management and response collection
5. **Analytics Service** (Port 3004) - Data analysis, reporting, and insights
6. **Notification Service** (Port 3005) - Real-time notifications and alerts
7. **SMS Service** (Port 3006) - SMS campaigns and conversations
8. **Asset Service** (Port 3007) - File uploads and organization themes

### Infrastructure

- **Database**: Shared Supabase PostgreSQL database
- **Cache & Message Queue**: Redis
- **Monitoring**: Prometheus + Grafana
- **Container Orchestration**: Docker Compose (development), Kubernetes (production)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Supabase account and project

### Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your Supabase credentials
4. Start all services:
   ```bash
   docker-compose up -d
   ```

### Development

To run services individually for development:

```bash
# Start infrastructure (Redis, Prometheus, Grafana)
docker-compose up redis prometheus grafana -d

# Run auth service locally
cd services/auth-service
npm install
npm run dev

# Run API gateway locally
cd services/api-gateway
npm install
npm run dev
```

## Service Communication

### Inter-Service Communication

- **Synchronous**: HTTP REST APIs for real-time operations
- **Asynchronous**: Redis pub/sub for events and notifications
- **Authentication**: JWT tokens for service-to-service communication

### API Routes

All client requests go through the API Gateway:

- `/api/auth/*` → Auth Service
- `/api/organizations/*` → Organization Service
- `/api/feedback/*` → Feedback Service
- `/api/analytics/*` → Analytics Service
- `/api/notifications/*` → Notification Service
- `/api/sms/*` → SMS Service
- `/api/assets/*` → Asset Service

## Monitoring & Observability

- **Prometheus**: Metrics collection at `http://localhost:9090`
- **Grafana**: Visualization dashboard at `http://localhost:3001` (admin/admin)
- **Health Checks**: Each service exposes `/health` endpoint

## Database Strategy

### Current Approach (Shared Database)

All services connect to the same Supabase database but access only their designated tables:

- **Auth Service**: `admin_users`, `user_invitations`, `user_sessions`
- **Organization Service**: `organizations`, `organization_users`, `organization_themes`, `organization_assets`
- **Feedback Service**: `questions`, `feedback_responses`, `feedback_sessions`, `question_*` tables
- **SMS Service**: `sms_*` tables
- **Notification Service**: `notifications`

### Future Migration (Database per Service)

For better service isolation, databases can be separated later with:
- Event sourcing for data consistency
- Saga pattern for distributed transactions
- CQRS for read/write separation

## Testing

### Unit Tests
```bash
cd services/auth-service
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/auth/health
```

## Deployment

### Production Deployment

1. **Kubernetes**: Use provided Helm charts in `k8s/` directory
2. **Docker Swarm**: Use `docker-compose.prod.yml`
3. **Environment Variables**: Configure secrets in your orchestration platform

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Building and testing services
- Security scanning
- Automated deployment
- Performance testing

## Migration Status

### ✅ Completed (Phase 1-2)
- [x] Infrastructure setup with Docker Compose
- [x] API Gateway implementation
- [x] Auth Service extraction and implementation
- [x] Monitoring setup (Prometheus + Grafana)
- [x] Service discovery and routing

### 🚧 In Progress (Phase 3)
- [ ] Organization Service implementation
- [ ] Feedback Service implementation
- [ ] Analytics Service implementation
- [ ] Notification Service implementation
- [ ] SMS Service implementation
- [ ] Asset Service implementation

### 📋 Pending (Phase 4-7)
- [ ] Frontend adaptation to use API Gateway
- [ ] Service client implementations
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Production deployment

## Troubleshooting

### Common Issues

1. **Service Discovery**: Ensure all services are running and healthy
2. **Database Connections**: Check Supabase credentials and network connectivity
3. **Port Conflicts**: Verify no other applications are using the same ports

### Debugging

```bash
# Check service logs
docker-compose logs auth-service

# Check service health
curl http://localhost:3001/health

# Monitor API Gateway
curl http://localhost:3000/health
```

## Contributing

1. Each service should be developed independently
2. Use conventional commit messages
3. Write tests for new functionality
4. Update documentation when adding features
5. Follow the established service patterns

## Next Steps

1. Complete the remaining service implementations
2. Update the frontend to use the API Gateway
3. Implement comprehensive testing
4. Set up production deployment pipeline
5. Monitor and optimize performance
