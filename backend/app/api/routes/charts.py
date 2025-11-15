import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from app.services import chart_service

router = APIRouter(prefix="/charts", tags=["charts"])


class ChartCreate(BaseModel):
    project_id: uuid.UUID
    dataset_version_id: uuid.UUID
    chart_type: str
    config: dict
    filters: dict | None = None


@router.post("", status_code=201)
async def create_chart(payload: ChartCreate):
    chart = await chart_service.create_chart(payload)
    return chart


@router.get("")
async def list_charts(project_id: uuid.UUID | None = None):
    return await chart_service.list_charts(project_id)


@router.post("/{chart_id}/export")
async def export_chart(chart_id: uuid.UUID, format: str = "png"):
    export = await chart_service.export_chart(chart_id=chart_id, format=format)
    return export

