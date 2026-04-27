# Backend API

REST API сервис для получения финансовых метрик из базы данных CBR Dashboard.

## 📋 Стек технологий

- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Helmet** - Security headers
- **CORS** - Cross-origin support
- **Winston** - Logging

## 📁 Архитектура

```
src/
├── app.js                 # Entry point
├── config/
│   └── database.js        # DB подключение и логирование
├── controllers/
│   └── data_controller.js # HTTP handlers
├── services/
│   └── data_service.js    # Business logic
├── repositories/
│   └── postgres_repo.js   # Database queries
├── clients/
│   └── etl_client.js      # ETL сервис интеграция
└── metrics/
    └── metics_calculator.js # Расчеты метрик
```

## 🚀 Установка и запуск

### Локально
```bash
npm install
npm start
```

### Docker
```bash
docker build -t cbr-backend .
docker run -d --name cbr-backend-container --network cbr-network -p 15001:15001 cbr-backend
docker logs cbr-backend-container
```

## 📡 API Endpoints

### GET /api/metrics
Получить метрику по названию с опциональной фильтрацией

**Параметры:**
- `metric` (required) - название метрики
- `from` (optional) - начальная дата (YYYY-MM-DD)
- `to` (optional) - конечная дата (YYYY-MM-DD)
- `operation` (optional) - агрегация (avg, sum, min, max)

**Примеры:**
```bash
curl "localhost:15001/api/metrics?metric=currency_rates_yuan"
curl "localhost:15001/api/metrics?metric=currency_rates_dollar&from=2024-01-01&to=2024-12-31"
curl "localhost:15001/api/metrics?metric=deposit_rates_1_to_3_years&operation=avg"
```

### GET /health
Проверка статуса сервиса

```bash
curl "localhost:15001/health"
```

## 🛡️ Безопасность

- Helmet для установки security headers
- CORS настроена
- Input validation на уровне контроллера
- Логирование всех ошибок

## 📝 OpenAPI

Full API specification доступна в `openapi.yaml`
