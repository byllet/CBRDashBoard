backend $ node install


docker build -t cbr-backend . 
docker run -d --name cbr-backend-container --network cbr-network -p 15001:15001 cbr-backend

docker logs cbr-backend-container

curl -X GET localhost:15654/api/metrics?metric=rub&from=2025-01-01&to=2000-12-31&place=moscow"
curl -X GET "localhost:15001/api/metrics?metric=rub&from=2000-01-01&"
curl -X GET "localhost:15654/api/metrics?metric=rub&from=2000-01-01&region=Moscow"
curl -X GET "localhost:15654/api/metrics?metric=rub&from=2000-01-01&region=Saint Petersburg"