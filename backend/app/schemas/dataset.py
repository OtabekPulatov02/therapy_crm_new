import uuid
from typing import Any

from pydantic import BaseModel


class DatasetBase(BaseModel):
    project_id: uuid.UUID
    name: str
    description: str | None = None
    source_type: str = "csv"
    column_types: dict[str, str] | None = None


class DatasetCreate(DatasetBase):
    pass


class DatasetOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    description: str | None = None
    source_type: str
    active_version_id: uuid.UUID | None = None
    schema_meta: dict[str, Any] | None = None

    class Config:
        from_attributes = True

