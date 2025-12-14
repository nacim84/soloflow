#!/bin/bash
# ============================================
# SoloFlow - Build Docker Images
# ============================================
# Description: Builds optimized Docker images for Gateway and Provider
# Usage: ./scripts/build-images.sh

set -e  # Exit on error

echo "=========================================="
echo "SoloFlow - Building Docker Images"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root directory
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

# Build Gateway image
echo -e "${BLUE}[1/2] Building Gateway image...${NC}"
echo "---------------------------------------"
docker build \
    -t soloflow/gateway:latest \
    -t soloflow/gateway:$(date +%Y%m%d) \
    ./api-gateway

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Gateway image built successfully${NC}"
else
    echo -e "${RED}✗ Gateway build failed${NC}"
    exit 1
fi

echo ""

# Build Provider image
echo -e "${BLUE}[2/2] Building Provider image...${NC}"
echo "---------------------------------------"
docker build \
    -t soloflow/provider:latest \
    -t soloflow/provider:$(date +%Y%m%d) \
    ./api-key-provider

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Provider image built successfully${NC}"
else
    echo -e "${RED}✗ Provider build failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}All images built successfully!${NC}"
echo "=========================================="
echo ""

# Show image sizes
echo "Image sizes:"
echo "---------------------------------------"
docker images | grep "soloflow/"

echo ""
echo "Next steps:"
echo "  1. Copy .env.docker.example to .env.docker"
echo "  2. Fill in real secrets in .env.docker"
echo "  3. Run: ./scripts/deploy-local.sh"
