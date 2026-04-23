FROM python:3.10-slim

WORKDIR /app

RUN apt-get update \
 && apt-get install -y gcc \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

ENV PYTHONPATH=/app/src
ENV ETL_PORT=15333
ENV NETWORK_NAME=cbr-db-container
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=cbr_db
ENV DB_PORT=5432

CMD ["python", "-m", "src.main"]