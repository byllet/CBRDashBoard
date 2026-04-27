# Frontend

Веб-приложение для визуализации финансовых данных ЦБ РФ. Интерактивные графики и таблицы для анализа курсов валют, кредитования и денежных агрегатов.

## 📋 Стек технологий

- **React 19** - UI библиотека
- **Vite** - Build tool
- **React Router** - Маршрутизация
- **Material-UI (MUI)** - UI компоненты
- **Recharts** - Графики
- **Date-fns** - Работа с датами
- **ESLint** - Линтинг

## 📁 Архитектура

```
src/
├── main.jsx           # Entry point
├── App.jsx            # Главный компонент с навигацией
├── App.css            # Глобальные стили
├── index.css          # Базовые стили
└── pages/
    ├── page1.jsx      # Курсы валют
    ├── page2.jsx      # Статистика кредитования
    ├── page3.jsx      # Денежные агрегаты
    ├── page4.jsx      # Ставки по депозитам
    └── page5.jsx      # Объёмы кредитования
```

## 🚀 Установка и запуск

### Локально
```bash
npm install
npm run dev
```

### Build для продакшена
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t cbr-frontend .
docker run -d --name cbr-frontend-container -p 5173:5173 cbr-frontend
```

### Docker Compose
```bash
docker-compose up -d frontend
```

## 🔧 Переменные окружения

```env
VITE_BACKEND_URL=http://localhost:15001
```

## 📄 Доступные страницы

- `/` - Курсы валют (USD, EUR, CNY)
- `/page2` - Статистика кредитования
- `/page3` - Денежные агрегаты
- `/page4` - Ставки по депозитам
- `/page5` - Объёмы кредитования

## 🛠️ Скрипты

- `npm run dev` - Запуск dev сервера
- `npm run build` - Build для продакшена
- `npm run preview` - Preview build
- `npm run lint` - Запуск ESLint
