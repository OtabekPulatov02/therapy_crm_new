# Therapy CRM Platform (therapy.uz)

End-to-end CRM, analytics, and reporting platform tailored for therapy.uz research teams.

## Repository Layout
- `docs/` – product/architecture specs (system overview, data model, APIs, analytics flows, UI blueprint).
- `backend/` – FastAPI backend scaffold with Celery workers for analytics & ML tasks.
- `frontend/` – React (Vite + Chakra UI) interface prototype with dashboard shell.
- `scripts/` – automation hooks (future).

## 🚀 Быстрый старт

### Локальная разработка

#### Вариант 1: Docker Compose (рекомендуется)
```bash
# Запустить все сервисы (PostgreSQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# Создать таблицы в БД
docker-compose exec backend poetry run python scripts/create_tables.py

# Логи
docker-compose logs -f
```

Сервисы будут доступны:
- Frontend: http://localhost:80
- Backend API: http://localhost:8000
- MinIO Console: http://localhost:9001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

#### Вариант 2: Ручной запуск
```bash
# 1. Запустить инфраструктуру (PostgreSQL, Redis, MinIO)
docker-compose up -d postgres redis minio

# 2. Backend
cd backend
poetry install
cp .env.example .env   # отредактируй DB/Redis credentials
poetry run python scripts/create_tables.py  # первый запуск
poetry run uvicorn app.main:app --reload

# 3. Celery worker (в отдельном терминале)
cd backend
poetry run celery -A app.core.celery_app.celery_app worker -l info

# 4. Frontend
cd frontend
npm install
cp .env.example .env   # установи VITE_API_URL=http://localhost:8000
npm run dev
```

## 🌐 Деплой в продакшн

### Render.com (бесплатный tier)

1. **Создай аккаунт на [Render.com](https://render.com)**

2. **Подключи GitHub репозиторий** к Render

3. **Создай сервисы через Render Dashboard:**

   **Backend (Web Service):**
   - Name: `therapy-crm-backend`
   - Environment: `Python 3`
   - Build Command: `cd backend && pip install poetry && poetry install --no-dev`
   - Start Command: `cd backend && poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`
   - Environment Variables:
     - `DATABASE_URL` (из PostgreSQL сервиса)
     - `REDIS_URL` (из Redis сервиса)
     - `ALLOWED_ORIGINS` = `https://your-frontend-url.onrender.com`
     - `JWT_SECRET` = (сгенерируй случайную строку)

   **Frontend (Static Site):**
   - Name: `therapy-crm-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment Variables:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com`

   **PostgreSQL (Database):**
   - Name: `therapy-crm-db`
   - Database: `therapy`
   - User: `crm`

   **Redis (Redis):**
   - Name: `therapy-crm-redis`

4. **Или используй автоматический деплой через `render.yaml`:**
   - В Render Dashboard выбери "New Blueprint"
   - Подключи репозиторий
   - Render автоматически создаст все сервисы из `render.yaml`

### Альтернативные платформы

**Vercel (Frontend) + Railway/Render (Backend):**
- Frontend: подключи `frontend/` к Vercel
- Backend: деплой на Railway или Render как Web Service

**Fly.io:**
```bash
# Установи flyctl
curl -L https://fly.io/install.sh | sh

# Деплой backend
cd backend
fly launch
fly deploy

# Деплой frontend
cd frontend
fly launch
fly deploy
```

## 📝 Переменные окружения

### Backend (`backend/.env`)
См. `backend/.env.example`

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000  # для продакшна: https://your-backend-url.onrender.com
```

## 🔧 Разработка

### Добавление зависимостей

**Backend:**
```bash
cd backend
poetry add package-name
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

### Миграции БД
```bash
cd backend
poetry run alembic revision --autogenerate -m "description"
poetry run alembic upgrade head
```

## 📚 Документация

- [Архитектура системы](docs/architecture.md)
- [Модель данных](docs/data-model.md)
- [API контракты](docs/api-contracts.md)
- [Аналитические пайплайны](docs/analytics-pipelines.md)
- [UI макеты](docs/ui-wireframe.md)

## 🐛 Troubleshooting

**Ошибка подключения к БД:**
- Проверь что PostgreSQL запущен: `docker-compose ps`
- Проверь переменные окружения в `.env`

**Frontend не подключается к API:**
- Убедись что `VITE_API_URL` установлен правильно
- Проверь CORS настройки в backend (`ALLOWED_ORIGINS`)

**Ошибки при деплое на Render:**
- Проверь что все зависимости указаны в `pyproject.toml` / `package.json`
- Убедись что build команды корректны
- Проверь логи в Render Dashboard

