docker compose -f docker-compose.gpu down
docker compose -f docker-compose.gpu up -d --build

sudo docker compose -f docker-compose.gpu build --no-cache
docker compose -f docker-compose.gpu up -d