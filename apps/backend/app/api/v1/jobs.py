from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_job_service, get_competition_service, get_notification_service
from app.services.job_service import JobService
from app.services.competition_service import CompetitionService
from app.services.notification_service import NotificationService
from app.core.security import get_current_user
from app.schemas.competition import CompetitionIndicatorSchema
import uuid

router = APIRouter()

@router.get("/")
async def list_jobs(
    page: int = Query(1, ge=1),
    perPage: int = Query(10, ge=1, le=50),
    job_service: JobService = Depends(get_job_service)
):
    return await job_service.list_jobs(page=page, per_page=perPage)

@router.get("/feed")
async def get_feed(
    page: int = Query(1, ge=1),
    perPage: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    user_id = uuid.UUID(current_user["sub"])
    return await job_service.get_feed(user_id=user_id, page=page, per_page=perPage)

@router.get("/{job_id}/competition", response_model=CompetitionIndicatorSchema)
async def get_job_competition(
    job_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    competition_service: CompetitionService = Depends(get_competition_service),
):
    user_id = uuid.UUID(current_user["sub"])
    return await competition_service.get_job_competition(job_id=job_id, user_id=user_id)

@router.get("/{job_id}")
async def get_job(job_id: uuid.UUID, job_service: JobService = Depends(get_job_service)):
    job = await job_service.get_job_detail(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job

@router.post("/")
async def create_job(
    job_data: dict,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter access required")
    return await job_service.create_job(job_data)

@router.post("/{job_id}/swipe")
async def swipe_job(
    job_id: uuid.UUID,
    direction: str = Query("right", regex="^(left|right|up)$"),
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
    notif_service: NotificationService = Depends(get_notification_service)
):
    user_id = uuid.UUID(current_user["sub"])
    res = await job_service.swipe_job(user_id=user_id, job_id=job_id, direction=direction)
    return res

@router.post("/{job_id}/save")
async def save_job(
    job_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
    notif_service: NotificationService = Depends(get_notification_service)
):
    user_id = uuid.UUID(current_user["sub"])
    res = await job_service.save_job(user_id=user_id, job_id=job_id)
    
    # Trigger notification
    await notif_service.create_notification(
        user_id=user_id,
        type_str="job_saved",
        title="Job Bookmarked",
        message="You saved a job listing to your library.",
        metadata={"jobId": str(job_id)}
    )
    return res

@router.delete("/{job_id}/save")
async def unsave_job(
    job_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    user_id = uuid.UUID(current_user["sub"])
    return await job_service.unsave_job(user_id=user_id, job_id=job_id)

@router.get("/saved")
async def get_saved_jobs(
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    user_id = uuid.UUID(current_user["sub"])
    return await job_service.get_saved_jobs(user_id=user_id)
