backend $ node install


docker build -t cbr-backend . 
docker run -d --name cbr-backend-container --network cbr-network -p 15001:15001 cbr-backend

docker logs cbr-backend-container

curl -X GET "localhost:15001/api/metrics?metric=credits_stats"
curl -X GET "localhost:15001/api/metrics?metric=currency_rates_yuan"
curl -X GET "localhost:15001/api/metrics?metric=currency_rates_yuan&from=2006-10-01&to=2006-12-01"
curl -X GET "localhost:15001/api/metrics?metric=currency_rates_yuan&operation=avg&from=2006-10-01&to=2006-12-01"
curl -X GET "localhost:15001/api/metrics?metric=currency_rates_yuan&operation=avg&from=2006-10-01&to=2006-12-01"
curl -X GET "localhost:15001/api/metrics?metric=deposit_rates_1_to_3_years"
curl -X GET "localhost:15001/api/metrics?metric=deposit_rates_1_to_3_years&from=2022-10-01"