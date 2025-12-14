# Deployment Command

You are deploying the SoloFlow production stack using Docker Compose.

## Steps to Execute

1. **Pre-deployment checks**:
   - Verify that `.env.docker` file exists at the project root
   - Check that all Dockerfiles are present for each service
   - Ensure no conflicting services are running on ports 5434, 8080, 3000, 3001, 6432

2. **Stop existing containers** (if any):
   ```bash
   docker-compose -f docker-compose.production.yml down
   ```

3. **Build all Docker images**:
   ```bash
   docker-compose -f docker-compose.production.yml build --no-cache
   ```

4. **Start the production stack**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

5. **Verify deployment**:
   - Check container status: `docker-compose -f docker-compose.production.yml ps`
   - Show logs: `docker-compose -f docker-compose.production.yml logs --tail=50`
   - Wait for health checks to pass (database, gateway, provider, admin-user)

6. **Post-deployment verification**:
   - Database should be healthy on port 5434
   - API Gateway should be running on port 8080
   - API Key Provider should be running on port 3000
   - Admin User dashboard should be running on port 3001
   - pgAdmin should be accessible on port 6432

7. **Display service URLs**:
   - API Gateway: http://localhost:8080
   - API Key Provider: http://localhost:3000
   - Admin User Dashboard: http://localhost:3001
   - pgAdmin: http://localhost:6432 (admin@admin.com / admin)

## Important Notes

- This command rebuilds all images from scratch (--no-cache)
- Previous containers will be stopped and removed
- Database data is persisted in Docker volumes (db_data, pgadmin_data)
- Check `.env.docker` for proper configuration before deploying
- Monitor logs for any startup errors

## Rollback

If deployment fails, you can rollback by running:
```bash
docker-compose -f docker-compose.production.yml down
```

Then investigate the logs and fix issues before redeploying.
