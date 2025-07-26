
#!/bin/bash

echo "Starting microservices with Docker Compose..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "Please update .env with your actual environment variables"
fi

# Start services
docker-compose up --build

echo "Microservices started!"
echo "API Gateway: http://localhost:3000"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001"
