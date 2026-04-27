# Database

PostgreSQL база данных для хранения финансовых данных ЦБ РФ для CBR Dashboard.

## 📋 Стек технологий

- **PostgreSQL** - Релационная база данных
- **Docker** - Контейнеризация

## 📊 Структура базы данных

### Таблицы

**economic_parameters** - Справочник экономических параметров
```sql
- parameter_id (SERIAL, PRIMARY KEY)
- parameter_name (TEXT)
```

**regions** - Справочник регионов
```sql
- region_id (SERIAL, PRIMARY KEY)
- region_name (TEXT)
```

**economic_data** - Основная таблица с экономическими данными
```sql
- id (SERIAL, PRIMARY KEY)
- parameter_id (INT, FOREIGN KEY)
- region_id (INT, FOREIGN KEY)
- record_date (DATE)
- parameter_value (FLOAT)
```

## 🚀 Установка и запуск

### Docker
```bash
docker build -t cbr-db .
docker run -d --name cbr-db-container --network cbr-network -p 5432:5432 cbr-db
```

### Docker Compose
```bash
docker-compose up -d database
```

## 🔧 Переменные окружения

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=cbr_db
DB_PORT=5432
```

## 📝 Поддерживаемые параметры

- `money_aggregates_*` - Денежные агрегаты
- `credits_stats_*` - Статистика по кредитам
- `deposit_rates_*` - Ставки по депозитам
- `loan_rates_*` - Ставки по кредитам
- `currency_rates_*` - Курсы валют