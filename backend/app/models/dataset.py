import uuid
from enum import Enum

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DatasetSource(str, Enum):
    csv = "csv"
    xlsx = "xlsx"
    sql = "sql"
    api = "api"
    db = "db"


class Dataset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "datasets"

    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text())
    source_type: Mapped[str] = mapped_column(String(32), default=DatasetSource.csv.value)
    storage_uri: Mapped[str | None] = mapped_column(Text())
    schema_meta: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    active_version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("dataset_versions.id"), nullable=True
    )

    project = relationship("Project", back_populates="datasets")
    versions = relationship(
        "DatasetVersion",
        back_populates="dataset",
        cascade="all, delete-orphan",
        order_by="DatasetVersion.version_number",
    )

