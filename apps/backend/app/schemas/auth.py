from pydantic import BaseModel, model_validator
from typing import Optional
import uuid

class UserRegister(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str
    full_name: Optional[str] = None
    fullName: Optional[str] = None
    role: str = "job_seeker"

    @model_validator(mode="before")
    @classmethod
    def resolve_full_name(cls, data: any):
        if isinstance(data, dict):
            em = data.get("email") or data.get("username") or ""
            fn = data.get("full_name") or data.get("fullName") or em.split("@")[0]
            data["email"] = em
            data["username"] = em
            data["full_name"] = fn
            data["fullName"] = fn
        return data

class UserLogin(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str
    role: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_login(cls, data: any):
        if isinstance(data, dict):
            em = data.get("email") or data.get("username") or ""
            data["email"] = em
            data["username"] = em
        return data

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    is_active: bool

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[list] = None
    experiences: Optional[list] = None
    social_links: Optional[list] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_completion: Optional[str] = None

class ProfileResponse(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[list] = []
    experiences: Optional[list] = []
    social_links: Optional[list] = []
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_completion: Optional[str] = None
