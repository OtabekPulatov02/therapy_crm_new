from functools import lru_cache
from typing import List
import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Therapy CRM API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://crm:crm@localhost:5432/therapy"
    redis_url: str = "redis://localhost:6379/0"
    broker_url: str = ""
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
        # Support both DATABASE_URL and database_url
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Use DATABASE_URL from env if available (Render, Railway, etc.)
        if "DATABASE_URL" in os.environ:
            self.database_url = os.environ["DATABASE_URL"]
        # Use REDIS_URL from env if available
        if "REDIS_URL" in os.environ:
            self.redis_url = os.environ["REDIS_URL"]
        # Set broker_url to redis_url if not explicitly set
        if not self.broker_url:
            self.broker_url = self.redis_url
        # Parse allowed_origins from string if needed
        if isinstance(self.allowed_origins, str):
            self.allowed_origins = [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()

