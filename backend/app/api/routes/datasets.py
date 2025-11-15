import uuid
from typing import List

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.services import dataset_service
from app.schemas.dataset import DatasetCreate, DatasetOut

router = APIRouter(tags=["datasets"])


@router.get("/datasets", response_model=List[DatasetOut])
async def list_datasets(
    project_id: uuid.UUID | None = None, session: AsyncSession = Depends(get_session)
):
    return await dataset_service.list_datasets(session=session, project_id=project_id)


@router.post("/datasets/upload", response_model=DatasetOut, status_code=201)
async def upload_dataset(
    project_id: uuid.UUID = Form(...),
    name: str = Form(...),
    description: str | None = Form(None),
    source_type: str = Form("csv"),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    payload = DatasetCreate(
        project_id=project_id,
        name=name,
        description=description,
        source_type=source_type,
    )
    dataset = await dataset_service.create_dataset(session=session, payload=payload, file=file)
    return dataset


class TransformRequest(BaseModel):
    dataset_id: uuid.UUID
    version_id: uuid.UUID
    operations: list[dict] = Field(default_factory=list)


@router.post("/datasets/transform")
async def transform_dataset(
    request: TransformRequest,
    session: AsyncSession = Depends(get_session),
):
    job = await dataset_service.enqueue_transform(session=session, request=request)
    return {"job_id": job.id}

