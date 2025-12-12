#!/bin/bash
# Copyright (c) 2025 kk
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

set -e

echo "=========================================="
echo "Video Manager Production Deployment Script"
echo "=========================================="
echo ""

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "ERROR: .env.prod file not found!"
    echo ""
    echo "Please create .env.prod file from .env.prod.example:"
    echo "  cp .env.prod.example .env.prod"
    echo "  # Then edit .env.prod with your production values"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "ERROR: docker-compose is not installed!"
    exit 1
fi

echo "Step 1: Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo ""
echo "Step 2: Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "Step 3: Waiting for services to be healthy..."
sleep 10

echo ""
echo "Step 4: Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "Deployment completed!"
echo "=========================================="
echo ""
echo "Services are running. Check logs with:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:8080/api"
echo "  Swagger: http://localhost/swagger/index.html"
echo ""

