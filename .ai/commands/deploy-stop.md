# Stop Deployment Command

Stop and remove all production Docker containers.

## Steps to Execute

1. **Stop all containers**:
   ```bash
   docker-compose -f docker-compose.production.yml down
   ```

2. **Verify containers are stopped**:
   ```bash
   docker-compose -f docker-compose.production.yml ps
   ```

3. **Optional: Remove volumes** (ask user first - THIS DELETES DATABASE DATA):
   If user confirms they want to delete all data:
   ```bash
   docker-compose -f docker-compose.production.yml down -v
   ```

## Important Notes

- This stops containers but PRESERVES database data in Docker volumes
- To completely remove everything including data, use the `-v` flag (ask user first!)
- Containers can be restarted with `/deploy` command
