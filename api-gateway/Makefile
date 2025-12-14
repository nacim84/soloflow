# ============================================
# API Gateway - Development Commands
# ============================================

.PHONY: help docker-dev-up docker-dev-down docker-dev-logs dev build clean test

# Default target
help:
	@echo "=========================================="
	@echo "API Gateway - Available Commands"
	@echo "=========================================="
	@echo "Development:"
	@echo "  make docker-dev-up    Start PostgreSQL (dev mode)"
	@echo "  make docker-dev-down  Stop PostgreSQL"
	@echo "  make docker-dev-logs  View PostgreSQL logs"
	@echo "  make dev              Run Gateway with hot reload"
	@echo ""
	@echo "Build & Test:"
	@echo "  make build            Build JAR with Maven"
	@echo "  make clean            Clean target directory"
	@echo "  make test             Run tests"
	@echo ""

# Docker commands
docker-dev-up:
	@echo "Starting PostgreSQL for development..."
	docker-compose -f docker-compose.dev.yml up -d

docker-dev-down:
	@echo "Stopping PostgreSQL..."
	docker-compose -f docker-compose.dev.yml down

docker-dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Development
dev:
	@echo "Starting Gateway with Spring Boot DevTools..."
	./mvnw spring-boot:run

# Build & Test
build:
	@echo "Building Gateway JAR..."
	./mvnw clean install

clean:
	@echo "Cleaning target directory..."
	./mvnw clean

test:
	@echo "Running tests..."
	./mvnw test
