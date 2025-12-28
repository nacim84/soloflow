# Docker Compose Up

Launch the Docker containers for the project (PostgreSQL, PGAdmin, etc.)

## Actions:
1. Execute `docker-compose up -d` to start all containers in detached mode
2. Wait for services to be ready
3. Display status of running containers

## What this does:
- Starts PostgreSQL database on port 5434
- Starts PGAdmin on port 5050
- Creates necessary networks and volumes
- Keeps containers running in background (-d flag)

Use `/docker-down` to stop containers.
