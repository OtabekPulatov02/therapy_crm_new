import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Dataset, DatasetVersion
from app.schemas.dataset import DatasetCreate
from app.services.storage import save_file


async def list_datasets(session: AsyncSession, project_id: uuid.UUID | None = None):
    stmt = select(Dataset)
    if project_id:
        stmt = stmt.where(Dataset.project_id == project_id)
    result = await session.execute(stmt)
    return result.scalars().all()


async def create_dataset(session: AsyncSession, payload: DatasetCreate, file: UploadFile):
    dataset = Dataset(
        project_id=payload.project_id,
        name=payload.name,
        description=payload.description,
        source_type=payload.source_type,
    )
    session.add(dataset)
    await session.flush()

    storage_path = Path("datasets") / str(dataset.id) / "raw" / file.filename
    saved_uri = save_file(file.file, storage_path.as_posix())

    version = DatasetVersion(
        dataset_id=dataset.id,
        version_number=1,
        rows=None,
        cols=None,
        parquet_uri=saved_uri,
    )
    session.add(version)
    await session.flush()

    dataset.storage_uri = saved_uri
    dataset.active_version_id = version.id

    await session.commit()
    await session.refresh(dataset)
    return dataset


async def enqueue_transform(*_, **__):
    return {"job_id": str(uuid.uuid4())}

