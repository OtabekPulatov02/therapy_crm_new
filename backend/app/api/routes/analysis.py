import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from app.workers import tasks

router = APIRouter(prefix="/analysis", tags=["analysis"])


class AnalysisRequest(BaseModel):
    project_id: uuid.UUID
    dataset_version_id: uuid.UUID
    parameters: dict
    filters: dict | None = None


@router.post("/kaplan-meier")
async def kaplan_meier(request: AnalysisRequest):
    job = tasks.run_kaplan_meier.delay(request.model_dump())
    return {"job_id": job.id}


@router.post("/roc")
async def roc(request: AnalysisRequest):
    job = tasks.run_roc_curve.delay(request.model_dump())
    return {"job_id": job.id}


@router.post("/ttest")
async def ttest(request: AnalysisRequest):
    job = tasks.run_ttest.delay(request.model_dump())
    return {"job_id": job.id}


@router.post("/anova")
async def anova(request: AnalysisRequest):
    job = tasks.run_anova.delay(request.model_dump())
    return {"job_id": job.id}


@router.post("/logistic")
async def logistic(request: AnalysisRequest):
    job = tasks.run_logistic_regression.delay(request.model_dump())
    return {"job_id": job.id}


@router.post("/ml/train")
async def ml_train(request: AnalysisRequest):
    job = tasks.run_ml_training.delay(request.model_dump())
    return {"job_id": job.id}


@router.post("/ml/predict")
async def ml_predict(request: AnalysisRequest):
    job = tasks.run_ml_prediction.delay(request.model_dump())
    return {"job_id": job.id}

