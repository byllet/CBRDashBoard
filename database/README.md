docker build -t cbr-db .

docker run -d --name cbr-db-container -p 5432:5432 cbr-db