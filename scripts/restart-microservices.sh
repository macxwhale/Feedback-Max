
#!/bin/bash

echo "Restarting microservices..."
docker-compose down
docker-compose up --build -d

echo "Microservices restarted!"
echo "API Gateway: http://localhost:3000"
