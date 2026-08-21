from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.core.security import get_current_user, parse_id
from app.api.deps import get_analytics_service
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import CandidateAnalyticsSchema, RecruiterAnalyticsSchema
import uuid

router = APIRouter()

@router.get("/candidate", response_model=CandidateAnalyticsSchema)
async def get_candidate_analytics(
    timeRange: str = Query("30d", regex="^(7d|30d|90d|all)$"),
    current_user: dict = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
):
    user_id = parse_id(current_user["sub"])
    data = await service.get_candidate_analytics(user_id=user_id, time_range=timeRange)
    return data

@router.get("/recruiter", response_model=RecruiterAnalyticsSchema)
async def get_recruiter_analytics(
    timeRange: str = Query("30d", regex="^(7d|30d|90d|all)$"),
    current_user: dict = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service),
):
    # Verify user role
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter or Admin access required for recruiter analytics"
        )
    user_id = parse_id(current_user["sub"])
    data = await service.get_recruiter_analytics(user_id=user_id, time_range=timeRange)
    return data

@router.get("/admin")
async def get_admin_analytics(
    current_user: dict = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    role = current_user.get("role", "job_seeker")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for global system analytics"
        )
    return await service.get_admin_analytics()
