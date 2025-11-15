import uuid
from sqlalchemy import ForeignKey, Integer, BigInteger
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DatasetVersion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "dataset_versions"

    dataset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("datasets.id"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    rows: Mapped[int | None] = mapped_column(BigInteger)
    cols: Mapped[int | None] = mapped_column(Integer)
    checksum: Mapped[str | None] = mapped_column()
    transformations: Mapped[list | None] = mapped_column(JSONB, default=list)
    validation_report: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    parquet_uri: Mapped[str | None] = mapped_column()

    dataset = relationship("Dataset", back_populates="versions")

