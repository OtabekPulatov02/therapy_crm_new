import uuid
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["projects"])


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
    return []


@router.post("/projects", response_model=ProjectOut, status_code=201)
async def create_project(payload: ProjectCreate):
    return ProjectOut(id=uuid.uuid4(), title=payload.title, diagnosis=payload.diagnosis, status="active")

