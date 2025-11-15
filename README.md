# Therapy CRM Platform (therapy.uz)

End-to-end CRM, analytics, and reporting platform tailored for therapy.uz research teams.

## Repository Layout
- `docs/` – product/architecture specs (system overview, data model, APIs, analytics flows, UI blueprint).
- `backend/` – FastAPI backend scaffold with Celery workers for analytics & ML tasks.
- `frontend/` – React (Vite + Chakra UI) interface prototype with dashboard shell.
- `scripts/` – automation hooks (future).

## Quick Start (Dev)
```bash
# Backend
cd backend
poetry install
cp .env.example .env   # edit DB/Redis credentials
poetry run python scripts/create_tables.py  # first run
poetry run uvicorn app.main:app --reload

# Celery worker
poetry run celery -A app.core.celery_app.celery_app worker -l info

# Frontend
cd ../frontend
npm install
npm run dev
```

Set environment variables via `backend/.env` (see `app/core/config.py` for defaults). Services expect PostgreSQL, Redis, MinIO (can be run with docker-compose later).

## Next Steps
1. Add remaining models/migrations (analysis jobs, reports, ML artifacts).
2. Swap local storage helper with MinIO/S3 client + validation pipeline.
3. Hook analytics tasks to stored parquet + persist results & exports.
4. Expand frontend into routed views backed by API calls + localization.
5. Introduce docker-compose/Helm manifests and CI workflows.

