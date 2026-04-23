python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

deactivate



curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "example_name",
    "time_from": "2024-01-01T00:00:00",
    "time_to": "2024-12-31T23:59:59",
    "location": "Moscow"
  }'

curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "credits_stats",
    "time_from": "2024-01-01T00:00:00",
    "time_to": "2024-12-31T23:59:59",
    "location": "Moscow"
  }'

  curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "credits_stats"
  }'

 curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "currency_rates"
  }'

   curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "money_aggregates"
  }'

     curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "deposit_rates"
  }'

       curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "loan_rates"
  }'


  docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "SELECT * FROM economic_data"

  docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "INSERT INTO economic_parameters (parameter_name) VALUES ('currency_rates'), ('credits_stats'), ('loan_rates'), ('money_aggregates'), ('deposit_rates');"

  docker exec -it cbr-db-container psql -U postgres -d cbr_db -c " INSERT INTO regions (region_name) VALUES ('msc'), ('spb'), ('smr'), ('ekt')"

docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "INSERT INTO regions (region_name) SELECT 'region_' || generate_series FROM generate_series(1, 200);"


credits_stats до 30 дней, включая ''до востребования'' 2
credits_stats от 31 до 90 дней 4
credits_stats от 91 до 180 дней 5
credits_stats от 181 дня до 1 года 6

currency_rates доллара сша к рублю на конец периода 98

money_aggregates всего 12

deposit_rates "до востребования" 1
deposit_rates до 30 дней, включая ''до востребования'' 2
deposit_rates до 30 дней, кроме ''до востребования'' 3
deposit_rates от 31 до 90 дней 4
deposit_rates от 91 до 180 дней 5
deposit_rates от 181 дня до 1 года 6

loan_rates всего 35


docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
DELETE FROM economic_parameters WHERE parameter_id IN (2, 4, 5, 6, 98, 12, 1, 3, 35);

INSERT INTO economic_parameters (parameter_id, parameter_name) VALUES 
(2, 'credits_stats до 30 дней, включая \"до востребования\"'),
(4, 'credits_stats от 31 до 90 дней'),
(5, 'credits_stats от 91 до 180 дней'),
(6, 'credits_stats от 181 дня до 1 года'),
(98, 'currency_rates доллара сша к рублю на конец периода'),
(12, 'money_aggregates всего'),
(1, 'deposit_rates \"до востребования\"'),
(2, 'deposit_rates до 30 дней, включая \"до востребования\"'),
(3, 'deposit_rates до 30 дней, кроме \"до востребования\"'),
(4, 'deposit_rates от 31 до 90 дней'),
(5, 'deposit_rates от 91 до 180 дней'),
(6, 'deposit_rates от 181 дня до 1 года'),
(35, 'loan_rates всего');
"