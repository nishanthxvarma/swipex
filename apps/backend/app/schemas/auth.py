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

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None
    refreshToken: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_refresh_token(cls, data: any):
        if isinstance(data, dict):
            t = data.get("refresh_token") or data.get("refreshToken")
            data["refresh_token"] = t
            data["refreshToken"] = t
        return data

class GoogleOAuthRequest(BaseModel):
    token: str
    role: Optional[str] = "job_seeker"

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    fullName: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[list] = None
    experience_years: Optional[str] = None
    experienceYears: Optional[str] = None
    education: Optional[list] = None
    certifications: Optional[list] = None
    projects: Optional[list] = None
    experiences: Optional[list] = None
    social_links: Optional[list] = None
    socialLinks: Optional[list] = None
    github_url: Optional[str] = None
    githubUrl: Optional[str] = None
    linkedin_url: Optional[str] = None
    linkedinUrl: Optional[str] = None
    portfolio_url: Optional[str] = None
    portfolioUrl: Optional[str] = None
    profile_completion: Optional[str] = None
    profileCompletion: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_profile_aliases(cls, data: any):
        if isinstance(data, dict):
            if "fullName" in data and not data.get("full_name"):
                data["full_name"] = data["fullName"]
            if "about" in data and not data.get("bio"):
                data["bio"] = data["about"]
            if "experienceYears" in data and not data.get("experience_years"):
                data["experience_years"] = str(data["experienceYears"])
            if "socialLinks" in data and not data.get("social_links"):
                data["social_links"] = data["socialLinks"]
            if "githubUrl" in data and not data.get("github_url"):
                data["github_url"] = data["githubUrl"]
            if "linkedinUrl" in data and not data.get("linkedin_url"):
                data["linkedin_url"] = data["linkedinUrl"]
            if "portfolioUrl" in data and not data.get("portfolio_url"):
                data["portfolio_url"] = data["portfolioUrl"]
            if "profileCompletion" in data and not data.get("profile_completion"):
                data["profile_completion"] = data["profileCompletion"]
        return data

class ProfileResponse(BaseModel):
    id: Optional[str] = None
    userId: Optional[str] = None
    user_id: Optional[str] = None
    full_name: Optional[str] = None
    fullName: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[list] = []
    experience_years: Optional[str] = None
    experienceYears: Optional[str] = None
    education: Optional[list] = []
    certifications: Optional[list] = []
    projects: Optional[list] = []
    experiences: Optional[list] = []
    social_links: Optional[list] = []
    socialLinks: Optional[list] = []
    github_url: Optional[str] = None
    githubUrl: Optional[str] = None
    linkedin_url: Optional[str] = None
    linkedinUrl: Optional[str] = None
    portfolio_url: Optional[str] = None
    portfolioUrl: Optional[str] = None
    profile_completion: Optional[str] = None
    profileCompletion: Optional[str] = None

class CandidateActionRequest(BaseModel):
    candidate_id: Optional[str] = None
    candidateId: Optional[str] = None
    action: str  # "pass", "shortlist", "interest"
    job_id: Optional[str] = None
    jobId: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_candidate_action_aliases(cls, data: any):
        if isinstance(data, dict):
            if "candidateId" in data and not data.get("candidate_id"):
                data["candidate_id"] = data["candidateId"]
            if "jobId" in data and not data.get("job_id"):
                data["job_id"] = data["jobId"]
        return data
