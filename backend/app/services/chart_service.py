import uuid


async def create_chart(payload):
    return {
        "id": uuid.uuid4(),
        "project_id": payload.project_id,
        "dataset_version_id": payload.dataset_version_id,
        "chart_type": payload.chart_type,
        "config": payload.config,
    }


async def list_charts(project_id=None):
    return []


async def export_chart(chart_id, format="png"):
    return {"chart_id": chart_id, "format": format, "download_url": f"https://cdn.example.com/{chart_id}.{format}"}

