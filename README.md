# CBRDashBoard

Dashboard для визуализации и анализа финансовых данных Центрального Банка России. Полнофункциональное веб-приложение с backend API, ETL сервисом и интерактивным фронтенд-интерфейсом.

## 📋 Общая информация

Проект состоит из четырех основных компонентов:
- **Frontend** - React приложение для визуализации данных
- **Backend** - Node.js API для получения метрик
- **ETL Service** - Python сервис для загрузки данных из API ЦБ РФ
- **Database** - PostgreSQL для хранения финансовых данных

## 🚀 Быстрый старт

### Docker Compose (рекомендуется)
```bash
docker compose up --build
```

Приложение будет доступно по адресу `http://localhost:5173`

Остановка:
```bash
docker compose down
```

### Локальное развертывание

Каждый компонент можно запустить отдельно. Подробнее смотрите в README каждого модуля:

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
- [ETL Service](./etl_service/README.md)
- [Database](./database/README.md)

## 🏗️ Архитектура проекта

```
CBRDashBoard/
├── frontend/          # React + Vite приложение
├── backend/           # Node.js API сервис
├── etl_service/       # Python ETL сервис
├── database/          # PostgreSQL инициализация
├── docker-compose.yaml
└── README.md
```

## 🔌 API Endpoints

### Backend (http://localhost:15001)
- `GET /api/metrics` - Получить метрики по параметрам
- `GET /health` - Health check

### ETL Service (http://localhost:15333)
- `POST /api/v1/` - Запустить ETL pipeline

## 🔧 Переменные окружения

Основные переменные в `docker-compose.yaml`:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=cbr_db
DB_PORT=5432
BACKEND_PORT=15001
ETL_PORT=15333
NETWORK_NAME=cbr-network
```

## 📊 Поддерживаемые метрики

- Курсы валют (USD, EUR, CNY)
- Денежные агрегаты (M0, M1, M2)
- Статистика кредитования
- Ставки по кредитам
- Ставки по депозитам

## 🛠️ Инструменты разработки

- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
