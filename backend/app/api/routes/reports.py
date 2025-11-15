import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportCreate(BaseModel):
    project_id: uuid.UUID
    template_id: uuid.UUID
    title: str
    sections: list[dict]


@router.post("", status_code=201)
async def create_report(payload: ReportCreate):
    report = await report_service.create_report(payload)
    return report


@router.post("/{report_id}/generate")
async def generate_report(report_id: uuid.UUID, format: str = "pdf"):
    job = await report_service.generate_report(report_id=report_id, format=format)
    return job


@router.get("/{report_id}")
async def get_report(report_id: uuid.UUID):
    return await report_service.get_report(report_id)

