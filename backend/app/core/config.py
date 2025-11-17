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
    allowed_origins: str = "http://localhost:3000"  # Will be converted to List[str] in __init__
    jwt_secret: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    analytics_bucket_prefix: str = "analytics"
    
    # Internal field to store parsed origins as list (will be set in __init__)
    _allowed_origins_list: List[str] = []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Support both DATABASE_URL and database_url
        case_sensitive = False
        # Don't include internal fields in model
        extra = "ignore"

    def __init__(self, **kwargs):
        # Handle DATABASE_URL conversion before pydantic validation
        if "DATABASE_URL" in os.environ:
            db_url = os.environ["DATABASE_URL"]
            if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
                kwargs["database_url"] = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif "database_url" not in kwargs:
                kwargs["database_url"] = db_url
        
        super().__init__(**kwargs)
        
        # Convert allowed_origins string to list after validation
        if isinstance(self.allowed_origins, str):
            if self.allowed_origins == "*":
                self._allowed_origins_list = ["*"]
            else:
                self._allowed_origins_list = [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        else:
            self._allowed_origins_list = self.allowed_origins if isinstance(self.allowed_origins, list) else [str(self.allowed_origins)]
        
        # Set broker_url to redis_url if not explicitly set
        if not self.broker_url:
            self.broker_url = self.redis_url
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Get allowed_origins as a list for use in CORS middleware."""
        if self._allowed_origins_list:
            return self._allowed_origins_list
        # Fallback if not set
        if isinstance(self.allowed_origins, str):
            return [self.allowed_origins]
        return self.allowed_origins if isinstance(self.allowed_origins, list) else [str(self.allowed_origins)]


@lru_cache
def get_settings() -> Settings:
    return Settings()

