# SoloFlow Development Workflow Guide

**Created**: 2025-12-14
**Sprint**: 1 - Containerization
**Status**: Complete

## Overview

This guide documents the complete development workflow for SoloFlow, covering both the **API Gateway** (Spring Boot) and **API Key Provider** (Next.js). Both projects now have consistent development setups with PostgreSQL via Docker and hot reload capabilities.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Development Setup                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │   API Gateway    │         │  API Key Provider │     │
│  │  (Spring Boot)   │         │    (Next.js)     │      │
│  │   Port: 8080     │         │   Port: 3000     │      │
│  └────────┬─────────┘         └────────┬─────────┘      │
│           │                            │                 │
│           │  Shared PostgreSQL (5434)  │                 │
│           └──────────┬─────────────────┘                 │
│                      │                                   │
│                 ┌────▼────┐                              │
│                 │ soloflow_db │                          │
│                 │ (Docker)    │                          │
│                 └─────────────┘                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Principle**: Both Gateway and Provider share the **same PostgreSQL database** to ensure atomic consistency between credit balance and API usage.

---

## 1. API Gateway Development (Spring Boot)

### 1.1 File Structure

```
api-gateway/
├── docker-compose.dev.yml    # PostgreSQL for dev (NEW)
├── Makefile                  # Convenience commands (NEW)
├── Dockerfile                # Production Docker build
├── pom.xml                   # Maven configuration
└── src/
    └── main/
        ├── java/             # Spring Boot application
        └── resources/
            └── application.yaml  # Configuration
```

### 1.2 Development Commands (Makefile)

The Gateway now has a `Makefile` with convenient commands:

```bash
cd api-gateway

# Start PostgreSQL in Docker
make docker-dev-up

# Run Gateway with hot reload (Spring DevTools)
make dev

# View PostgreSQL logs
make docker-dev-logs

# Stop PostgreSQL
make docker-dev-down

# Build JAR
make build

# Clean target directory
make clean

# Run tests
make test
```

### 1.3 Manual Commands (without Makefile)

```bash
cd api-gateway

# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Run Gateway
./mvnw spring-boot:run

# Stop PostgreSQL
docker-compose -f docker-compose.dev.yml down
```

### 1.4 Configuration

**docker-compose.dev.yml** (PostgreSQL only):
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: api-gateway-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: soloflow_db
    ports:
      - "5434:5432"  # Host:Container
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**application.yaml** (Spring Boot):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5434/soloflow_db
    username: postgres
    password: postgres
```

**Hot Reload**: Enabled by Spring Boot DevTools (included in pom.xml)

---

## 2. API Key Provider Development (Next.js)

### 2.1 File Structure

```
api-key-provider/
├── docker-compose.dev.yml    # PostgreSQL for dev (renamed)
├── package.json              # npm scripts (updated)
├── Dockerfile                # Production Docker build
├── .env.local                # Development secrets
└── app/                      # Next.js app
```

### 2.2 Development Commands (npm scripts)

The Provider has npm scripts for convenience:

```bash
cd api-key-provider

# Start PostgreSQL in Docker
npm run docker:dev:up

# Run Provider with hot reload (Next.js Fast Refresh)
npm run dev

# View PostgreSQL logs
npm run docker:dev:logs

# Stop PostgreSQL
npm run docker:dev:down
```

### 2.3 Database Operations (Drizzle ORM)

```bash
cd api-key-provider

# Generate migrations from schema changes
npm run db:generate

# Push schema directly (dev only - no migrations)
npm run db:push

# Open Drizzle Studio UI
npm run db:studio

# Seed the 3 real services (PDF, AI, Mileage)
npm run seed:services
```

### 2.4 Configuration

**docker-compose.dev.yml** (PostgreSQL only):
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: api-key-provider-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: soloflow_db  # MUST match Gateway
    ports:
      - "5434:5432"
```

**.env.local** (Next.js):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/soloflow_db
API_KEY_PEPPER=64dmIFxCMbRkCEdSHGftxNAs17s5I5cT15lOy/bcX4Q=  # MUST match Gateway
BETTER_AUTH_SECRET=64dmIFxCMbRkCEdSHGftxNAs17s5I5cT15lOy/bcX4Q=
BETTER_AUTH_URL=http://localhost:3000
```

**Hot Reload**: Enabled by Next.js Fast Refresh (default in dev mode)

---

## 3. Complete Development Workflow

### Scenario 1: Working on Gateway Only

```bash
# 1. Start PostgreSQL
cd api-gateway
make docker-dev-up

# 2. Run Gateway
make dev

# 3. Test Gateway
curl -H "X-API-Key: sk_live_test" http://localhost:8080/actuator/health

# 4. Stop PostgreSQL when done
make docker-dev-down
```

### Scenario 2: Working on Provider Only

```bash
# 1. Start PostgreSQL
cd api-key-provider
npm run docker:dev:up

# 2. Push schema (if needed)
npm run db:push

# 3. Seed services (first time only)
npm run seed:services

# 4. Run Provider
npm run dev

# 5. Open browser
# http://localhost:3000

# 6. Stop PostgreSQL when done
npm run docker:dev:down
```

### Scenario 3: Full Stack Development (Gateway + Provider)

```bash
# Terminal 1: Start PostgreSQL (choose one)
cd api-gateway && make docker-dev-up
# OR
cd api-key-provider && npm run docker:dev:up

# Terminal 2: Run Gateway
cd api-gateway
make dev

# Terminal 3: Run Provider
cd api-key-provider
npm run dev

# Now you have:
# - Gateway:  http://localhost:8080
# - Provider: http://localhost:3000
# - Database: localhost:5434
```

**Important**: Only one PostgreSQL container is needed. Both projects share the same database.

---

## 4. Production Deployment (Docker Compose)

### 4.1 File Structure

```
soloflow/ (project root)
├── docker-compose.production.yml   # Full stack orchestration
├── .env.docker                     # Production secrets
├── .env.docker.example             # Template
└── scripts/
    ├── build-images.sh             # Build Docker images
    └── deploy-local.sh             # Automated deployment
```

### 4.2 Build Docker Images

```bash
# From project root
./scripts/build-images.sh

# Output:
# soloflow/gateway:latest   348MB
# soloflow/provider:latest  215MB
```

### 4.3 Deploy Full Stack

```bash
# From project root
./scripts/deploy-local.sh

# This will:
# 1. Check/generate secrets in .env.docker
# 2. Build images (if needed)
# 3. Start all services:
#    - database (PostgreSQL)
#    - gateway (API Gateway)
#    - provider (API Key Provider)
#    - pgadmin (PostgreSQL UI)
# 4. Wait for health checks
```

### 4.4 Manual Production Deployment

```bash
# 1. Create .env.docker from template
cp .env.docker.example .env.docker

# 2. Fill in real secrets
nano .env.docker

# 3. Build images
docker build -t soloflow/gateway:latest ./api-gateway
docker build -t soloflow/provider:latest ./api-key-provider

# 4. Start services
docker-compose -f docker-compose.production.yml up -d

# 5. Check health
docker-compose -f docker-compose.production.yml ps

# 6. View logs
docker-compose -f docker-compose.production.yml logs -f

# 7. Stop services
docker-compose -f docker-compose.production.yml down
```

---

## 5. Key Differences: Development vs Production

| Aspect                | Development                          | Production                              |
|-----------------------|--------------------------------------|-----------------------------------------|
| **PostgreSQL**        | Docker (dev compose)                 | Docker (production compose)             |
| **Gateway**           | `./mvnw spring-boot:run` (hot reload)| Docker container (compiled JAR)         |
| **Provider**          | `npm run dev` (Fast Refresh)         | Docker container (standalone build)     |
| **Environment Files** | `.env.local` (Provider)              | `.env.docker` (shared)                  |
| **Port Exposure**     | 8080, 3000, 5434 on localhost        | Same, but via Docker network            |
| **Hot Reload**        | ✅ Enabled (DevTools, Fast Refresh) | ❌ Disabled (production builds)         |
| **Database Volume**   | Local Docker volume                  | Docker volume (persistent)              |

---

## 6. Troubleshooting

### Issue 1: "Port 5434 already in use"

**Cause**: PostgreSQL is already running from another docker-compose file.

**Solution**:
```bash
# Check running containers
docker ps | grep postgres

# Stop any existing PostgreSQL
cd api-gateway && make docker-dev-down
cd api-key-provider && npm run docker:dev:down
```

**Note**: Only ONE PostgreSQL container is needed for both projects.

### Issue 2: "Database connection refused"

**Cause**: PostgreSQL container not started or not healthy.

**Solution**:
```bash
# Check container status
docker ps | grep postgres

# Check logs
cd api-gateway && make docker-dev-logs
# OR
cd api-key-provider && npm run docker:dev:logs

# Restart PostgreSQL
make docker-dev-down && make docker-dev-up
```

### Issue 3: "API_KEY_PEPPER mismatch"

**Cause**: Gateway and Provider have different peppers.

**Solution**:
```bash
# Check Gateway's application.yaml
grep pepper api-gateway/src/main/resources/application.yaml

# Check Provider's .env.local
grep API_KEY_PEPPER api-key-provider/.env.local

# Ensure both use the SAME value
```

### Issue 4: "Table does not exist"

**Cause**: Database schema not applied.

**Solution**:
```bash
cd api-key-provider

# Push schema
npm run db:push

# Seed services
npm run seed:services
```

---

## 7. Best Practices

### 7.1 Development Workflow

1. **Start PostgreSQL first** before running Gateway or Provider
2. **Use hot reload** for faster iteration (DevTools for Java, Fast Refresh for Next.js)
3. **Share one PostgreSQL container** for both projects
4. **Stop PostgreSQL when done** to free resources

### 7.2 Database Schema Changes

When modifying the schema:

1. **Edit** `api-key-provider/drizzle/schema.ts`
2. **Push** schema: `npm run db:push` (dev) or `npm run db:generate && npm run db:migrate` (prod)
3. **Update** Gateway JPA entities in `api-gateway/src/main/java/com/rnblock/gateway/model/`
4. **Test** both Gateway and Provider to ensure compatibility

### 7.3 Environment Variables

**Critical**: These MUST match between Gateway and Provider:
- `API_KEY_PEPPER` - For SHA-256 hashing
- `DATABASE_URL` - MUST point to `soloflow_db`

**Generate secure secrets**:
```bash
# API_KEY_PEPPER
openssl rand -base64 32

# BETTER_AUTH_SECRET
openssl rand -base64 32
```

---

## 8. Quick Reference

### Gateway Commands
```bash
make docker-dev-up     # Start PostgreSQL
make dev               # Run Gateway with hot reload
make docker-dev-logs   # View logs
make docker-dev-down   # Stop PostgreSQL
make build             # Build JAR
make test              # Run tests
```

### Provider Commands
```bash
npm run docker:dev:up    # Start PostgreSQL
npm run dev              # Run Provider with hot reload
npm run docker:dev:logs  # View logs
npm run docker:dev:down  # Stop PostgreSQL
npm run db:push          # Push schema
npm run seed:services    # Seed data
```

### Production Commands
```bash
./scripts/build-images.sh   # Build Docker images
./scripts/deploy-local.sh   # Deploy full stack
docker-compose -f docker-compose.production.yml ps    # Check status
docker-compose -f docker-compose.production.yml logs  # View logs
docker-compose -f docker-compose.production.yml down  # Stop all
```

---

## 9. Summary of Changes (Sprint 1)

### Files Created
1. `api-gateway/docker-compose.dev.yml` - PostgreSQL for Gateway development
2. `api-gateway/Makefile` - Convenience commands for Gateway
3. `api-key-provider/docker-compose.dev.yml` - Renamed from `docker-compose.yml`

### Files Modified
1. `api-key-provider/package.json` - Added `docker:dev:*` scripts
2. `CLAUDE.md` - Updated with development workflow documentation
3. `docker-compose.production.yml` - Enhanced healthchecks (previous sprint)

### Benefits
- ✅ **Consistent** development experience for both Gateway and Provider
- ✅ **Isolated** PostgreSQL via Docker (no local install needed)
- ✅ **Hot reload** for fast iteration (Spring DevTools + Next.js Fast Refresh)
- ✅ **Production-ready** Docker Compose orchestration
- ✅ **Clear separation** between dev (hot reload) and prod (containerized) workflows

---

## Conclusion

SoloFlow now has a **complete, consistent development workflow** for both the API Gateway and API Key Provider. Developers can:

1. **Start PostgreSQL** with a single command (`make docker-dev-up` or `npm run docker:dev:up`)
2. **Run applications** with hot reload for fast iteration
3. **Deploy to production** with Docker Compose and health checks
4. **Share a single database** to maintain the core architecture principle

This setup balances **developer experience** (hot reload, minimal setup) with **production readiness** (Docker, health checks, multi-stage builds).
