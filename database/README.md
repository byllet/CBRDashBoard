docker build -t cbr-db .
docker rm -f $(docker ps -aq)
docker run -d --name cbr-db-container -p 5432:5432 cbr-db
docker run -d --name cbr-db-container --network cbr-network -p 5432:5432 cbr-db

docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
INSERT INTO regions (region_name) VALUES 
('Moscow'),
('Saint Petersburg')"

docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
INSERT INTO economic_parameters (parameter_name) VALUES 
('rub'),
('usd')"

docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
INSERT INTO economic_data (parameter_id, region_id, record_date, parameter_value) VALUES 
(1, 1, '2024-01-15', 1250.50),
(2, 1, '2024-01-15', 8.5),
(1, 2, '2024-01-15', 980.75)"

docker run -d --name cbr-db-container -p 5432:5432 cbr-db

docker run -d --name cbr-db-container --network cbr-network -p 5432:5432 cbr-db


docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
INSERT INTO regions (region_name) VALUES 
('Moscow'),
('Saint Petersburg')"

docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
INSERT INTO economic_parameters (parameter_name) VALUES 
('rub'),
('usd')"

docker exec -it cbr-db-container psql -U postgres -d cbr_db -c "
INSERT INTO economic_data (parameter_id, region_id, record_date, parameter_value) VALUES 
(1, 1, '2024-01-15', 1250.50),
(2, 1, '2024-01-15', 8.5),
(1, 2, '2024-01-15', 980.75)"