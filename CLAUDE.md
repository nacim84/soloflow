# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoloFlow is an **API monetization ecosystem** with atomic credit-based billing. It consists of three main components:

1. **API Gateway** (`/api-gateway`) - Spring Boot enforcement layer for security and billing
2. **API Key Provider** (`/api-key-provider`) - Next.js developer portal for key management and credit purchasing
3. **Backend Services** (`/services`) - Microservices providing business value (e.g., PDF tools, AI, mileage)

**Core Architecture Principle**: The Gateway and Provider share a single PostgreSQL database to ensure atomic consistency between credit balance and API usage. This eliminates sync latency and prevents race conditions.

## Development Commands

### API Gateway (Spring Boot)

```bash
# Navigate to gateway directory
cd api-gateway

# Development workflow (PostgreSQL via Docker + hot reload)
make docker-dev-up          # Start PostgreSQL (port 5434)
make dev                    # Run Gateway with Spring DevTools hot reload
make docker-dev-logs        # View PostgreSQL logs
make docker-dev-down        # Stop PostgreSQL

# Alternative: Using docker-compose directly
docker-compose -f docker-compose.dev.yml up -d

# Build the project
./mvnw clean install

# Run the application (default port: 8080)
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Skip tests during build
./mvnw clean install -DskipTests

# Run only tests
./mvnw test

# Clean target directory
make clean                  # or ./mvnw clean
```

### API Key Provider (Next.js)

```bash
# Navigate to provider directory
cd api-key-provider

# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Development with Stripe webhook listener
npm run dev:full

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations (Drizzle ORM)
npm run db:generate    # Generate migrations from schema
npm run db:migrate     # Apply migrations
npm run db:push        # Push schema directly (dev only)
npm run db:studio      # Open Drizzle Studio UI

# Seed data
npm run seed:services  # Seed the 3 real services (PDF, AI, Mileage)

# Key migration (one-time operation)
npm run migrate:keys   # Migrate from AES-256 to SHA-256 hashing
```

### Database (PostgreSQL via Docker)

```bash
# Development: PostgreSQL only (for local dev with hot reload)
# Both Gateway and Provider have identical dev setups

# For Gateway development:
cd api-gateway
make docker-dev-up           # Start PostgreSQL (port 5434)
make docker-dev-down         # Stop PostgreSQL
# or: docker-compose -f docker-compose.dev.yml up -d

# For Provider development:
cd api-key-provider
npm run docker:dev:up        # Start PostgreSQL (port 5434)
npm run docker:dev:down      # Stop PostgreSQL
# or: docker-compose -f docker-compose.dev.yml up -d

# Production: Full stack (PostgreSQL + Gateway + Provider)
# From project root
docker-compose -f docker-compose.production.yml up -d
```

### Backend Services

```bash
# Example: api-n8n service
cd services/api-n8n
./mvnw spring-boot:run
```

## Architecture & High-Level Design

### Request Flow (API Gateway)

```
Client Request (with X-API-Key header)
  ↓
[ApiKeyAuthFilter] - Extract & validate API key (OncePerRequestFilter)
  ↓
[ApiKeyValidationService] - Check Caffeine cache for ApiKey by key_hash
  ↓
[Database Query] - If cache miss: Hash key (SHA-256 + pepper), lookup api_keys table
  ↓
[Rate Limit Check] - Bucket4j in-memory bucket (10 req/sec default, per key_hash)
  ↓
[Credit Deduction] - Atomic SQL on wallets table:
                      UPDATE wallets SET balance = balance - 1
                      WHERE orgId = ? AND balance > 0
  ↓
[Spring Cloud Gateway MVC] - Route to backend service (if all checks pass)
  ↓
Backend Service Response
```

**Critical Implementation Details**:
- **Organization-Based**: Credits are stored in the `wallets` table, keyed by `orgId` (not per API key)
- **Atomic Transaction**: The entire validation is wrapped in `@Transactional` to ensure consistency
- **Cache Strategy**: ApiKey objects are cached by key_hash; wallet balance is fetched fresh each time
- **Rate Limiting**: In-memory Bucket4j instances (not distributed - see Scalability Considerations)
- **Security Point**: The filter chain MUST validate credits BEFORE routing. If credit deduction fails, the request never reaches the backend.

### Shared Database Architecture

Both `api-gateway` and `api-key-provider` connect to the same PostgreSQL instance:

- **Gateway**: Uses JPA/Hibernate with raw JDBC for atomic updates
- **Provider**: Uses Drizzle ORM for type-safe schema management

**Important**: When modifying database schema in `api-key-provider/drizzle/schema.ts`, ensure compatibility with Gateway's JPA entities in `api-gateway/src/main/java/com/rnblock/gateway/model/`.

### Key Tables

- `user` - Better Auth user accounts
- `session` - Better Auth sessions
- `account` - Better Auth OAuth providers
- `api_keys` - API keys with SHA-256 hashed values; links to orgId (shared by both apps)
- `wallets` - Credit balances per organization (orgId); atomic updates
- `services` - Available services (PDF, AI, Mileage)
- `api_usage` - Usage logs for analytics
- `organizations` - Organization metadata for B2B multi-tenancy

## Code Organization

### API Gateway (`/api-gateway`)

```
src/main/java/com/rnblock/gateway/
├── config/
│   ├── SecurityConfig.java       # Spring Security filter chain
│   └── CacheConfig.java          # Caffeine cache configuration
├── security/
│   └── ApiKeyAuthFilter.java     # Main validation filter (OncePerRequestFilter)
├── service/
│   └── ApiKeyValidationService.java  # Cache + DB + Rate limit logic
├── repository/
│   ├── ApiKeyRepository.java     # Spring Data JPA
│   └── WalletRepository.java
├── model/
│   ├── ApiKey.java               # JPA Entity
│   └── Wallet.java
├── exception/
│   ├── GlobalExceptionHandler.java   # Centralized error handling
│   ├── InvalidApiKeyException.java
│   ├── InsufficientCreditsException.java
│   └── RateLimitExceededException.java
└── GatewayApiN8nApplication.java

src/main/resources/
└── application.yaml              # Spring config (DB, routing, cache)
```

### API Key Provider (`/api-key-provider`)

```
app/
├── (auth)/                       # Better Auth routes
├── api/                          # API routes (webhooks, etc.)
├── keys/                         # API key management UI
├── services/                     # Service catalog UI
├── usage/                        # Analytics dashboard
├── actions/                      # Server Actions (Next.js)
└── layout.tsx, page.tsx

drizzle/
├── schema.ts                     # Database schema (Drizzle)
├── db.ts                         # Database connection
├── migrations/                   # Generated migrations
└── seed/                         # Seed scripts

components/                       # Shadcn/UI components
lib/                              # Utilities, auth config
```

## Configuration & Environment Variables

### API Gateway (`api-gateway/src/main/resources/application.yaml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5434/soloflow_db
    username: postgres
    password: postgres

  api:
    key:
      pepper: ${API_KEY_PEPPER}  # Must match provider's pepper

  cloud:
    gateway:
      mvc:
        routes:
          - id: service-1
            uri: http://localhost:8081
            predicates:
              - Path=/api/v1/service-1/**
```

### API Key Provider (`.env.local`)

```env
# Database (MUST match Gateway's database)
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/soloflow_db

# Security (MUST match Gateway's pepper)
API_KEY_PEPPER=your-secret-pepper-here

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email (Resend)
RESEND_API_KEY=...
```

## Development Conventions

### Java (API Gateway)

- **Package Structure**: Standard Spring Boot layered architecture (config → security → service → repository → model)
- **Lombok**: Used extensively (@RequiredArgsConstructor, @Slf4j, @Data)
- **Testing Policy**: No unit tests for filters (policy from README). Focus on integration tests if needed.
- **Error Handling**: All exceptions throw custom exceptions (InvalidApiKeyException, InsufficientCreditsException) handled by GlobalExceptionHandler
- **Transaction Management**: Credit deduction uses `@Transactional` with atomic SQL updates

### TypeScript (API Key Provider)

- **Framework**: Next.js 16 App Router (Server Components by default)
- **Server Actions**: Used for mutations (located in `app/actions/`)
- **Validation**: Zod schemas for all inputs
- **State Management**: Zustand for global state, TanStack Query v5 for server state
- **UI Components**: Shadcn/UI with Tailwind CSS v4
- **Type Safety**: Strict TypeScript, no `any` types
- **Database**: Drizzle ORM with type inference from schema

### Database Modifications

When changing the database schema:

1. **Update Drizzle Schema** (`api-key-provider/drizzle/schema.ts`)
2. **Generate Migration**: `npm run db:generate`
3. **Apply Migration**: `npm run db:migrate` OR `npm run db:push` (dev only)
4. **Update JPA Entities** in `api-gateway/src/main/java/com/rnblock/gateway/model/`
5. **Test Both Applications** to ensure compatibility

**CRITICAL**: The `api_keys` table structure is shared. Changes must be coordinated between both apps.

## Security & API Key Handling

### API Key Format

- **Prefix**: `sk_live_` (production) or `sk_test_` (test mode)
- **Storage**: SHA-256 hash + pepper (one-way hashing, irreversible)
- **Display**: Full key shown ONCE at creation, then only prefix + last 4 chars

### Hashing Algorithm (Both Apps)

```
hash = SHA256(apiKey + pepper)
```

Where `pepper` is a secret environment variable shared between Gateway and Provider.

### Credit Deduction (Gateway)

The credit deduction MUST be atomic to prevent race conditions:

```sql
UPDATE api_keys
SET credits = credits - 1, updated_at = NOW()
WHERE key_hash = ?
  AND credits > 0
  AND is_active = true
```

If the update affects 0 rows, throw `InsufficientCreditsException`.

## Common Development Workflows

### Adding a New Backend Service

1. Create service in `/services/your-service/`
2. Add route in Gateway's `application.yaml`:
   ```yaml
   - id: your-service
     uri: http://localhost:8084
     predicates:
       - Path=/api/v1/your-service/**
   ```
3. Add service metadata in Provider's database (or use `npm run seed:services` pattern)

### Modifying API Key Validation Logic

Edit `api-gateway/src/main/java/com/rnblock/gateway/service/ApiKeyValidationService.java`

### Adding New UI Pages (Provider)

1. Create route in `app/your-page/page.tsx`
2. Add to navigation in `components/layout/`
3. Create Server Actions in `app/actions/your-actions.ts`
4. Use TanStack Query for data fetching

### Testing API Gateway Locally

```bash
# Start Gateway
cd api-gateway && ./mvnw spring-boot:run

# Test with curl
curl -H "X-API-Key: sk_live_your_key_here" http://localhost:8080/api/v1/service-1/test
```

## Multi-Tenancy & Organizations (Sprint 1+)

The system supports multi-organization (B2B) architecture:

- **Roles**: `owner`, `admin`, `developer`, `billing`
- **Wallets**: Each organization has a separate wallet
- **Test Wallets**: Individual users get 100 free credits/month
- **Scopes**: API keys can be restricted to specific services (e.g., `pdf:read`, `ai:write`)

## Important Notes

- **No Unit Tests for Filters**: Per Gateway README, security filters are not unit tested
- **Shared Database is Critical**: Both apps must always point to the same PostgreSQL instance
- **Pepper Must Match**: The `API_KEY_PEPPER` environment variable must be identical in both apps
- **Atomic Updates**: Never manually update credits; always use atomic SQL or the service layer
- **Schema Compatibility**: JPA entities (Gateway) and Drizzle schema (Provider) must stay in sync

## Port Allocation

- API Gateway: `8080`
- API Key Provider: `3000`
- PostgreSQL: `5434` (NOTE: Not the default 5432!)
- Backend Services: `8081`, `8082`, `8083`, etc.

## Error Responses (API Gateway)

The Gateway returns structured JSON error responses:

### 401 Unauthorized (Invalid/Missing API Key)
```json
{
  "error": "Unauthorized",
  "message": "API key is invalid or inactive",
  "timestamp": "2024-12-13T10:30:00Z"
}
```

### 402 Payment Required (Insufficient Credits)
```json
{
  "error": "Payment Required",
  "message": "Insufficient credits",
  "timestamp": "2024-12-13T10:30:00Z"
}
```

### 429 Too Many Requests (Rate Limit Exceeded)
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": "1",
  "timestamp": "2024-12-13T10:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "timestamp": "2024-12-13T10:30:00Z"
}
```

**Note**: If the API_KEY_PEPPER is not configured, the Gateway will throw a RuntimeException on startup or first request.

## Debugging & Troubleshooting

### Common Issues

#### 1. API Key Not Working
```bash
# Check if key exists and is active
# In api-key-provider database
psql -h localhost -p 5434 -U postgres soloflow_db
SELECT id, "keyHash", "orgId", "isActive" FROM api_keys WHERE "keyHash" = 'your_hash_here';

# Check wallet balance
SELECT * FROM wallets WHERE "orgId" = 'org_id_here';
```

#### 2. Credits Not Deducting
- Verify both apps use the **same database** and **same pepper**
- Check Gateway logs for transaction failures
- Ensure wallet exists for the orgId linked to the API key

#### 3. Rate Limiting Issues
- Rate limits are **per-instance, in-memory** (not shared across Gateway replicas)
- Default: 10 requests/second per API key
- Restart Gateway to reset rate limit buckets

#### 4. Cache Staleness
- API keys are cached in Caffeine (1 hour expiry by default)
- If a key is revoked in Provider, Gateway may still accept it until cache expires
- Solution: Restart Gateway or wait for cache TTL

#### 5. Pepper Mismatch
If you see: `Server configuration error: Pepper missing`
- Check `API_KEY_PEPPER` environment variable in Gateway
- Ensure it matches the pepper in Provider's `.env.local`
- Pepper is required at runtime; missing pepper = crash

#### 6. Database Connection Issues
```bash
# Test PostgreSQL connectivity
psql -h localhost -p 5434 -U postgres -d soloflow_db -c "SELECT 1;"

# Check if both apps can connect
# Gateway: Check logs for Hibernate connection pool messages
# Provider: Run npm run db:studio
```

### Viewing Logs

#### Gateway Logs
```bash
# Default Spring Boot logging to console
cd api-gateway && ./mvnw spring-boot:run

# Look for:
# - "API key validated successfully" (debug level)
# - "Invalid or inactive API key attempted" (warn)
# - "Insufficient credits for org" (warn)
# - "Rate limit exceeded" (warn)
```

#### Provider Logs
```bash
# Next.js dev server logs
cd api-key-provider && npm run dev

# Check browser console for client-side errors
# Check terminal for Server Action errors
```

#### Database Query Logs
Enable SQL logging in Gateway's `application.yaml`:
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

## Documentation Conventions

### AI-Generated Documentation
Store AI-generated implementation documentation in `docs/ai/`:
- Use descriptive filenames (e.g., `sprint-1-execution-guide.md`, `credits-badge-fix.md`)
- Document each sprint, phase, or major feature
- Include implementation decisions, troubleshooting steps, and lessons learned
- Current documentation includes Sprint 1 refactoring, pricing consolidation, and EPCT workflow analyses

### Code Comments
- Minimal inline comments (code should be self-documenting)
- Use Javadoc for public APIs and service methods
- Document WHY, not WHAT (the code shows what)

## Scalability Considerations

### Current Limitations

1. **Rate Limiting is Not Distributed**
   - Bucket4j buckets are in-memory per Gateway instance
   - If you run multiple Gateway instances, each has its own rate limits
   - Solution: Implement Redis-backed rate limiting for distributed deployments

2. **Cache is Not Distributed**
   - Caffeine cache is local to each Gateway instance
   - Revoking a key in Provider won't immediately invalidate cache across all Gateways
   - Solution: Use Redis for shared caching or reduce TTL

3. **Database is a Single Point of Failure**
   - Both apps depend on the same PostgreSQL instance
   - Solution: PostgreSQL replication, read replicas, or managed database service

4. **Wallet Contention**
   - High-traffic organizations may experience contention on wallet updates
   - Solution: Database-level optimizations (connection pooling, indexing) or eventual consistency model

### Horizontal Scaling Strategy

For production deployment:
1. Run multiple instances of API Gateway (behind load balancer)
2. Implement distributed rate limiting (Redis + Bucket4j)
3. Implement distributed caching (Redis for API key cache)
4. Use PostgreSQL read replicas for read-heavy operations
5. Consider sharding wallets by orgId for very high scale

## Common Pitfalls

### ⚠️ CRITICAL MISTAKES TO AVOID

1. **Different Peppers**: Gateway and Provider MUST use identical `API_KEY_PEPPER` values
2. **Different Databases**: Both apps MUST connect to the same PostgreSQL instance
3. **Wrong Port**: PostgreSQL is on `5434`, not the default `5432`
4. **Direct Credit Updates**: Never manually UPDATE wallets; always use the repository method for atomicity
5. **Schema Divergence**: Changing Drizzle schema without updating JPA entities will cause runtime errors
6. **Cache Assumptions**: Don't assume instant key revocation; cache has TTL
7. **Testing Filters**: Per project policy, don't write unit tests for security filters
8. **Forgetting Transactions**: Credit deduction must be transactional; missing `@Transactional` causes race conditions
9. **Rate Limit Assumptions**: Rate limits don't persist across Gateway restarts

### Development Gotchas

- **API Key Display**: Keys are only shown once at creation; can't be retrieved later
- **Hash Debugging**: Can't reverse SHA-256 hash; must store key temporarily during creation for display
- **Organization Model**: Credits belong to organizations, not individual users
- **Test vs Live Keys**: Prefix `sk_test_` vs `sk_live_` for different environments
- **Migration Script**: `npm run migrate:keys` is a ONE-TIME operation (AES to SHA-256); don't run repeatedly
