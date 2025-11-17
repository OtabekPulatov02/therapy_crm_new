from functools import lru_cache
from typing import List, Any
import os

from pydantic_settings import BaseSettings
from pydantic import model_validator


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

    @model_validator(mode="before")
    @classmethod
    def parse_env_vars(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Convert postgresql:// to postgresql+asyncpg://
            if "database_url" in values:
                db_url = values["database_url"]
                if isinstance(db_url, str) and db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
                    values["database_url"] = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            
            # Convert allowed_origins string to list
            if "allowed_origins" in values:
                origins = values["allowed_origins"]
                if isinstance(origins, str):
                    if origins == "*":
                        values["allowed_origins"] = ["*"]
                    else:
                        values["allowed_origins"] = [o.strip() for o in origins.split(",") if o.strip()]
        
        return values

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set broker_url to redis_url if not explicitly set
        if not self.broker_url:
            self.broker_url = self.redis_url


@lru_cache
def get_settings() -> Settings:
    return Settings()

