#!/bin/bash
# ============================================
# SoloFlow - Local Deployment
# ============================================
# Description: Deploys SoloFlow stack locally using Docker Compose
# Usage: ./scripts/deploy-local.sh

set -e  # Exit on error

echo "=========================================="
echo "SoloFlow - Local Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}Project root:${NC} $PROJECT_ROOT"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

# Check .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo -e "${YELLOW}WARNING: .env.docker not found${NC}"
    echo ""
    echo "Creating .env.docker from .env.docker.example..."

    if [ -f ".env.docker.example" ]; then
        cp .env.docker.example .env.docker
        echo -e "${YELLOW}⚠ IMPORTANT: Edit .env.docker and fill in real secrets!${NC}"
        echo ""
        echo "Required secrets:"
        echo "  - API_KEY_PEPPER (generate with: openssl rand -base64 32)"
        echo "  - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)"
        echo "  - STRIPE_SECRET_KEY"
        echo "  - Other optional secrets (see .env.docker)"
        echo ""
        read -p "Press Enter after editing .env.docker, or Ctrl+C to cancel..."
    else
        echo -e "${RED}ERROR: .env.docker.example not found${NC}"
        exit 1
    fi
fi

# Generate secrets if they don't exist
source .env.docker 2>/dev/null || true

if [ -z "$API_KEY_PEPPER" ] || [ "$API_KEY_PEPPER" == "your_pepper_here_use_openssl_rand_base64_32" ]; then
    echo -e "${YELLOW}Generating API_KEY_PEPPER...${NC}"
    NEW_PEPPER=$(openssl rand -base64 32)
    sed -i.bak "s|API_KEY_PEPPER=.*|API_KEY_PEPPER=$NEW_PEPPER|" .env.docker
    echo -e "${GREEN}✓ Generated API_KEY_PEPPER${NC}"
fi

if [ -z "$BETTER_AUTH_SECRET" ] || [ "$BETTER_AUTH_SECRET" == "your_auth_secret_here_use_openssl_rand_base64_32" ]; then
    echo -e "${YELLOW}Generating BETTER_AUTH_SECRET...${NC}"
    NEW_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$NEW_SECRET|" .env.docker
    echo -e "${GREEN}✓ Generated BETTER_AUTH_SECRET${NC}"
fi

echo ""

# Stop existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

echo ""

# Start services
echo -e "${BLUE}Starting services...${NC}"
echo "---------------------------------------"
docker-compose -f docker-compose.production.yml up -d

echo ""
echo -e "${BLUE}Waiting for services to be healthy...${NC}"

# Wait for database
echo -n "  Database: "
for i in {1..30}; do
    if docker exec soloflow-db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Gateway
echo -n "  Gateway:  "
for i in {1..60}; do
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Provider
echo -n "  Provider: "
for i in {1..60}; do
    if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo "=========================================="
echo ""

# Show service URLs
echo "Services running:"
echo "---------------------------------------"
echo -e "  Gateway:  ${BLUE}http://localhost:8080${NC}"
echo -e "  Provider: ${BLUE}http://localhost:3000${NC}"
echo -e "  Database: ${BLUE}localhost:5434${NC}"
echo -e "  PgAdmin:  ${BLUE}http://localhost:6432${NC}"
echo ""

# Show health status
echo "Health checks:"
echo "---------------------------------------"
docker-compose -f docker-compose.production.yml ps

echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose -f docker-compose.production.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.production.yml down"
echo "  Restart:       docker-compose -f docker-compose.production.yml restart"
