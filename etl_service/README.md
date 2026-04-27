# ETL Service

Сервис для извлечения, трансформации и загрузки финансовых данных из API ЦБ РФ в PostgreSQL.

## 📋 Стек технологий

- **Python 3.x** - Runtime
- **FastAPI** - Web framework
- **AsyncPG** - Асинхронный PostgreSQL драйвер
- **Uvicorn** - ASGI сервер
- **Requests** - HTTP клиент
- **python-dotenv** - Управление переменными окружения

## 📁 Архитектура

```
src/
├── main.py           # Entry point, инициализация приложения
├── controller.py     # HTTP endpoints
├── orchestrator.py   # Оркестрация ETL процесса
├── etl_pipeline.py   # ETL pipeline для полной загрузки данных
├── api_client.py     # Клиент для ЦБ РФ API
├── data_handler.py   # Обработка и трансформация данных
├── repository.py     # Database queries
├── data_models.py    # Pydantic модели
└── config.py         # Конфигурация
```

## 🚀 Установка и запуск

### Локально
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

### Docker
```bash
docker build -t cbr-etl .
docker run -d --name cbr-etl-container --network cbr-network -p 15333:15333 cbr-etl
docker logs cbr-etl-container
```

## 🔧 Переменные окружения

```env
DATABASE_URL=postgresql://user:password@host:5432/cbr_db
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=cbr_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
CBR_API_URL=https://www.cbr-xml-rpc.ru
PORT=15333
```

## 📡 API Endpoints

### POST /api/v1/
Запустить ETL pipeline для определенного набора данных

**Body:**
```json
{
  "name": "string",           // required: currency_rates, credits_stats, loan_rates, money_aggregates, deposit_rates
  "time_from": "ISO 8601",    // optional: начальная дата
  "time_to": "ISO 8601"       // optional: конечная дата
}
```

**Примеры:**
```bash
curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "currency_rates",
    "time_from": "2024-01-01T00:00:00",
    "time_to": "2024-12-31T23:59:59"
  }'

curl -X POST "http://localhost:15333/api/v1/" \
  -H "Content-Type: application/json" \
  -d '{"name": "credits_stats"}'
```

## 📊 Поддерживаемые метрики

- `currency_rates` - Курсы иностранных валют
- `credits_stats` - Статистика по кредитам
- `loan_rates` - Ставки по кредитам
- `money_aggregates` - Денежные агрегаты
- `deposit_rates` - Ставки по депозитам

## 🔄 ETL Pipeline

1. **Extract** - Получение данных из API ЦБ РФ
2. **Transform** - Обработка и нормализация данных
3. **Load** - Сохранение в PostgreSQL

Процесс асинхронный и поддерживает обработку больших объемов данных.