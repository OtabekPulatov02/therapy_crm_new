import uuid


async def create_report(payload):
    return {
        "id": uuid.uuid4(),
        "project_id": payload.project_id,
        "template_id": payload.template_id,
        "title": payload.title,
        "sections": payload.sections,
        "status": "draft",
    }


async def generate_report(report_id: uuid.UUID, format: str):
    return {"job_id": uuid.uuid4(), "report_id": report_id, "format": format}


async def get_report(report_id: uuid.UUID):
    return {"id": report_id, "status": "draft"}

