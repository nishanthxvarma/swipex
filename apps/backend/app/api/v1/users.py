from fastapi import APIRouter, Depends
from app.api.deps import get_user_service
from app.services.user_service import UserService
from app.core.security import get_current_user

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user), user_service: UserService = Depends(get_user_service)):
    return await user_service.get_profile(current_user["id"])

@router.put("/profile")
async def update_profile(current_user: dict = Depends(get_current_user), user_service: UserService = Depends(get_user_service)):
    pass

@router.post("/resume/upload")
async def upload_resume():
    pass

@router.get("/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user), user_service: UserService = Depends(get_user_service)):
    return await user_service.get_dashboard_stats(current_user["id"])
