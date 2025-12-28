# Deployment Status Command

Check the status of all production Docker containers and services.

## Steps to Execute

1. **Show container status**:
   ```bash
   docker-compose -f docker-compose.production.yml ps
   ```

2. **Check health status**:
   ```bash
   docker ps --filter "name=soloflow" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```

3. **Test service endpoints**:
   - Gateway health: `curl -f http://localhost:8080/actuator/health || echo "Gateway not responding"`
   - Provider health: `curl -f http://localhost:3000/api/health || echo "Provider not responding"`
   - Admin health: `curl -f http://localhost:3001/api/health || echo "Admin not responding"`
   - Database: `docker exec soloflow-db pg_isready -U postgres || echo "Database not ready"`

4. **Show resource usage**:
   ```bash
   docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps --filter "name=soloflow" -q)
   ```

## Summary

Provide a clear summary to the user:
- Which services are running (✓) or stopped (✗)
- Health check status for each service
- Port accessibility
- Resource usage overview
- Any warnings or issues detected
