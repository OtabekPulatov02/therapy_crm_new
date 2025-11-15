from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Therapy CRM API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://crm:crm@localhost:5432/therapy"
    redis_url: str = "redis://localhost:6379/0"
    broker_url: str = redis_url
    minio_endpoint: str = "http://localhost:9000"
    minio_bucket: str = "therapy-crm"
    minio_access_key: str = "minio"
    minio_secret_key: str = "minio123"
    allowed_origins: List[str] = ["http://localhost:3000"]
    jwt_secret: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    analytics_bucket_prefix: str = "analytics"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

