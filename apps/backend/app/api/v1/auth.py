from fastapi import APIRouter, Depends, Header, Request, HTTPException, status
from typing import Optional
from app.schemas.auth import (
    UserRegister, UserLogin, TokenResponse, ForgotPasswordRequest,
    ResetPasswordRequest, RefreshTokenRequest, GoogleOAuthRequest
)
from app.services.auth_service import AuthService
from app.api.deps import get_auth_service
from app.core.security import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.register(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, auth_service: AuthService = Depends(get_auth_service)):
    email = data.email or data.username
    return await auth_service.login(email, data.password)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: Optional[RefreshTokenRequest] = None,
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    token = None
    if data and (data.refresh_token or data.refreshToken):
        token = data.refresh_token or data.refreshToken
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh token required in body or Authorization header")
    return await auth_service.refresh_token(token)

@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    user = await auth_service.user_repo.get_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    profile = await auth_service.user_repo.get_profile(user.id)
    full_name = profile.full_name if (profile and profile.full_name) else user.email.split("@")[0]
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "fullName": full_name,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "profile": {
            "headline": profile.headline if profile else "",
            "location": profile.location if profile else "",
            "skills": profile.skills if profile else []
        }
    }

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.forgot_password(data.email)

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.reset_password(data.token, data.new_password)

@router.post("/google-oauth", response_model=TokenResponse)
async def google_oauth(data: GoogleOAuthRequest, auth_service: AuthService = Depends(get_auth_service)):
    return await auth_service.google_oauth(data.token, data.role or "job_seeker")
