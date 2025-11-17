from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.routes import datasets, analysis, charts, reports, projects

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix=settings.api_v1_prefix)
app.include_router(datasets.router, prefix=settings.api_v1_prefix)
app.include_router(analysis.router, prefix=settings.api_v1_prefix)
app.include_router(charts.router, prefix=settings.api_v1_prefix)
app.include_router(reports.router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root():
    return {
        "message": "Therapy CRM API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/healthz",
        "api": settings.api_v1_prefix
    }


@app.get("/healthz")
async def healthcheck():
    return {"status": "ok"}

