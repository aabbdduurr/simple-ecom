#!/bin/bash

# Check if docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker Desktop for Mac from https://www.docker.com/products/docker-desktop/"
  exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "docker-compose is not installed. Please install docker-compose."
  exit 1
fi

# Bring down any existing containers (optional, for a clean start)
docker-compose down

# Build and start the containers in the background
docker-compose up --build -d

echo "Waiting for PostgreSQL to initialize..."
# Wait for a few seconds to allow PostgreSQL to be ready. Adjust time if needed.
sleep 10

echo "Running database migrations..."
# Run migrations automatically inside the backend container
docker-compose exec backend npm run migrate:up

echo "Running database initialization script..."
# Optionally run the DB initialization script in the backend container if needed
docker-compose exec backend node init_db.js

echo "Containers are up and running."
echo "Backend is available at http://localhost:3000"
echo "To view logs, run: docker-compose logs -f"
