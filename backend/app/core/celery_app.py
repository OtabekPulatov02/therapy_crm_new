from celery import Celery

from .config import get_settings


def create_celery_app() -> Celery:
    settings = get_settings()
    celery = Celery(
        "therapy_crm",
        broker=settings.broker_url,
        backend=settings.redis_url,
        include=["app.workers.tasks"],
    )
    celery.conf.update(task_track_started=True, task_serializer="json", result_serializer="json")
    return celery


celery_app = create_celery_app()

