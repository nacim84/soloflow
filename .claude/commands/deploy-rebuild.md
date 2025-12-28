# Rebuild Specific Service Command

Rebuild and restart a specific service without affecting others.

## Steps to Execute

1. **Ask user which service to rebuild**:
   - gateway (API Gateway - Spring Boot)
   - provider (API Key Provider - Next.js)
   - admin-user (Admin Dashboard - Next.js)
   - database (PostgreSQL - rarely needed)
   - pgadmin (pgAdmin - rarely needed)

2. **Rebuild the selected service**:
   ```bash
   docker-compose -f docker-compose.production.yml build --no-cache <service-name>
   ```

3. **Restart the service**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d <service-name>
   ```

4. **Verify the service is running**:
   ```bash
   docker-compose -f docker-compose.production.yml logs --tail=50 <service-name>
   ```

## Use Cases

- You made code changes to one service and want to redeploy just that service
- A single service crashed and needs to be restarted
- You want to test a fix without rebuilding the entire stack

## Notes

- This is faster than full `/deploy` as it only rebuilds one service
- Database dependent services (gateway, provider, admin-user) will reconnect automatically
- Healthchecks will ensure the service is ready before marking it as healthy
