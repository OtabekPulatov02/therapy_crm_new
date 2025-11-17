from functools import lru_cache
from typing import List, Union
import os

from pydantic_settings import BaseSettings
from pydantic import field_validator


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
    allowed_origins: Union[str, List[str]] = ["http://localhost:3000"]
    jwt_secret: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    analytics_bucket_prefix: str = "analytics"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Support both DATABASE_URL and database_url
        case_sensitive = False

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            # Handle comma-separated string or single value
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("database_url", mode="before")
    @classmethod
    def convert_database_url(cls, v):
        if isinstance(v, str) and v.startswith("postgresql://") and "+asyncpg" not in v:
            # Convert postgresql:// to postgresql+asyncpg:// for asyncpg driver
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set broker_url to redis_url if not explicitly set
        if not self.broker_url:
            self.broker_url = self.redis_url


@lru_cache
def get_settings() -> Settings:
    return Settings()

