from fastapi import APIRouter, Depends
from app.api.deps import get_job_service
from app.services.job_service import JobService
from app.core.security import get_current_user
import uuid

router = APIRouter()

@router.get("/")
async def list_jobs(job_service: JobService = Depends(get_job_service)):
    return []

@router.get("/feed")
async def get_feed(current_user: dict = Depends(get_current_user), job_service: JobService = Depends(get_job_service)):
    return []

@router.get("/{job_id}")
async def get_job(job_id: uuid.UUID, job_service: JobService = Depends(get_job_service)):
    return await job_service.get_job_detail(job_id)

@router.post("/")
async def create_job(current_user: dict = Depends(get_current_user), job_service: JobService = Depends(get_job_service)):
    pass

@router.post("/{job_id}/swipe")
async def swipe_job(job_id: uuid.UUID, current_user: dict = Depends(get_current_user)):
    pass

@router.post("/{job_id}/save")
async def save_job(job_id: uuid.UUID, current_user: dict = Depends(get_current_user)):
    pass

@router.delete("/{job_id}/save")
async def unsave_job(job_id: uuid.UUID, current_user: dict = Depends(get_current_user)):
    pass

@router.get("/saved")
async def get_saved_jobs(current_user: dict = Depends(get_current_user)):
    return []
