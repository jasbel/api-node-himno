docker build -t api-himno .

docker stop api-himno-container

docker rm api-himno-container

docker run -d -p 8001:8001 --name api-himno-container api-himno
# # O con docker-compose
# docker-compose up --build
# docker-compose start