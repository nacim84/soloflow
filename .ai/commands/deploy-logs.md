# Deployment Logs Command

Display logs from the running production Docker containers.

## Steps to Execute

1. **Show logs for all services**:
   ```bash
   docker-compose -f docker-compose.production.yml logs --tail=100 --follow
   ```

2. **Or show logs for specific service** (ask user which service):
   - Database: `docker-compose -f docker-compose.production.yml logs --tail=100 --follow database`
   - Gateway: `docker-compose -f docker-compose.production.yml logs --tail=100 --follow gateway`
   - Provider: `docker-compose -f docker-compose.production.yml logs --tail=100 --follow provider`
   - Admin User: `docker-compose -f docker-compose.production.yml logs --tail=100 --follow admin-user`
   - pgAdmin: `docker-compose -f docker-compose.production.yml logs --tail=100 --follow pgadmin`

## Notes

- Use `--follow` to stream logs in real-time
- Press Ctrl+C to stop following logs
- Logs are helpful for debugging startup issues or runtime errors
