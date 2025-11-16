# 🚀 Инструкция по деплою Therapy CRM

## Render.com (Рекомендуется - бесплатный tier)

### Шаг 1: Подготовка

1. Зарегистрируйся на [Render.com](https://render.com) (можно через GitHub)
2. Подключи свой GitHub репозиторий `OtabekPulatov02/therapy_crm_new`

### Шаг 2: Автоматический деплой через Blueprint

**Самый простой способ:**

1. В Render Dashboard нажми **"New"** → **"Blueprint"**
2. Выбери репозиторий `therapy_crm_new`
3. Render автоматически обнаружит `render.yaml` и создаст все сервисы
4. Подожди пока все сервисы задеплоятся (5-10 минут)

### Шаг 3: Ручной деплой (если Blueprint не работает)

#### 3.1. PostgreSQL Database

1. **New** → **PostgreSQL**
2. Name: `therapy-crm-db`
3. Database: `therapy`
4. User: `crm`
5. Region: `Oregon` (или ближайший)
6. Plan: **Free**
7. Нажми **Create Database**
8. Скопируй **Internal Database URL** (нужен для backend)

#### 3.2. Redis

1. **New** → **Redis**
2. Name: `therapy-crm-redis`
3. Region: `Oregon`
4. Plan: **Free**
5. Нажми **Create Redis**
6. Скопируй **Internal Redis URL**

#### 3.3. Backend Service

1. **New** → **Web Service**
2. Connect репозиторий `therapy_crm_new`
3. Настройки:
   - **Name**: `therapy-crm-backend`
   - **Region**: `Oregon`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install poetry && poetry install --no-dev
     ```
   - **Start Command**:
     ```bash
     poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: **Free**

4. **Environment Variables**:
   ```
   DATABASE_URL = <Internal Database URL из шага 3.1>
   REDIS_URL = <Internal Redis URL из шага 3.2>
   BROKER_URL = <то же что REDIS_URL>
   ALLOWED_ORIGINS = https://therapy-crm-frontend.onrender.com
   JWT_SECRET = <сгенерируй случайную строку, например через openssl rand -hex 32>
   MINIO_ENDPOINT = http://localhost:9000
   MINIO_BUCKET = therapy-crm
   MINIO_ACCESS_KEY = minio
   MINIO_SECRET_KEY = minio123
   ```

5. Нажми **Create Web Service**

6. После деплоя, выполни миграции:
   - В Render Dashboard открой сервис backend
   - Перейди в **Shell**
   - Выполни:
     ```bash
     poetry run python scripts/create_tables.py
     ```

#### 3.4. Frontend Service

1. **New** → **Static Site**
2. Connect репозиторий `therapy_crm_new`
3. Настройки:
   - **Name**: `therapy-crm-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**:
     ```
     VITE_API_URL = https://therapy-crm-backend.onrender.com
     ```

4. Нажми **Create Static Site**

### Шаг 4: Обновление URL'ов

После деплоя frontend получит свой URL (например `https://therapy-crm-frontend-xxxx.onrender.com`).

1. Обнови `ALLOWED_ORIGINS` в backend сервисе на реальный URL frontend
2. Обнови `VITE_API_URL` в frontend сервисе на реальный URL backend
3. Перезапусти оба сервиса (Render сделает это автоматически при изменении env vars)

## Альтернатива: Vercel (Frontend) + Render (Backend)

### Frontend на Vercel:

1. Зарегистрируйся на [Vercel.com](https://vercel.com)
2. **New Project** → подключи GitHub репозиторий
3. Настройки:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL = https://your-backend-url.onrender.com
     ```
4. Deploy

### Backend на Render:

Следуй инструкциям выше для backend (шаг 3.3)

## Локальный тест перед деплоем

```bash
# Запусти все через Docker Compose
docker-compose up -d

# Проверь что все работает
curl http://localhost:8000/api/v1/health
curl http://localhost:80
```

## Troubleshooting

### Backend не запускается

- Проверь логи в Render Dashboard
- Убедись что `DATABASE_URL` и `REDIS_URL` правильные
- Проверь что все зависимости в `pyproject.toml`

### Frontend показывает ошибки API

- Проверь что `VITE_API_URL` установлен правильно
- Проверь CORS настройки (`ALLOWED_ORIGINS`)
- Открой DevTools → Network и посмотри ошибки

### База данных не подключается

- Убедись что используешь **Internal Database URL** (не External)
- Проверь что database name и user правильные
- Попробуй пересоздать database

## Полезные ссылки

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

