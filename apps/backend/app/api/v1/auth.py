from fastapi import APIRouter, Depends
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import AuthService
from app.api.deps import get_auth_service
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.register(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.login(data.email, data.password)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(auth_service: AuthService = Depends(get_auth_service)):
    # token passed in header
    pass

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, auth_service: AuthService = Depends(get_auth_service)):
    pass

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, auth_service: AuthService = Depends(get_auth_service)):
    pass

@router.post("/google-oauth")
async def google_oauth(auth_service: AuthService = Depends(get_auth_service)):
    pass
