# backend/app/core/celery_app.py
from celery import Celery

celery_app = Celery(
    "payments",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "payments"}
}

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)