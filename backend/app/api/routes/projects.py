import uuid
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["projects"])

# Предопределенные проекты
PROJECTS = [
    {"id": "550e8400-e29b-41d4-a716-446655440001", "title": "PRIM-01-08", "diagnosis": "Артериальная гипертензия", "status": "active"},
    {"id": "550e8400-e29b-41d4-a716-446655440002", "title": "FZ-2020103185", "diagnosis": "Сахарный диабет 2 типа", "status": "active"},
    {"id": "550e8400-e29b-41d4-a716-446655440003", "title": "FZ-2020103184", "diagnosis": "Ишемическая болезнь сердца", "status": "active"},
    {"id": "550e8400-e29b-41d4-a716-446655440004", "title": "АL-492598621", "diagnosis": "Хроническая сердечная недостаточность", "status": "active"},
    {"id": "550e8400-e29b-41d4-a716-446655440005", "title": "FL-9524114982", "diagnosis": "Метаболический синдром", "status": "active"},
]


class ProjectOut(BaseModel):
    id: uuid.UUID
    title: str
    diagnosis: str | None = None
    status: str


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    diagnosis: str | None = None


@router.get("/projects", response_model=List[ProjectOut])
async def list_projects():
    return [ProjectOut(**project) for project in PROJECTS]


@router.post("/projects", response_model=ProjectOut, status_code=201)
async def create_project(payload: ProjectCreate):
    return ProjectOut(id=uuid.uuid4(), title=payload.title, diagnosis=payload.diagnosis, status="active")

