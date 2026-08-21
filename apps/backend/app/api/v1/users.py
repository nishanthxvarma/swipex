from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_user_service
from app.services.user_service import UserService
from app.core.security import get_current_user

router = APIRouter()

def format_candidate(user) -> dict:
    profile = user.profile
    full_name = profile.full_name if profile and profile.full_name else "Candidate"
    
    colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"]
    color_idx = sum(ord(c) for c in full_name) % len(colors)
    avatar_color = colors[color_idx]
    
    headline = profile.headline if profile and profile.headline else "Software Engineer"
    location = profile.location if profile and profile.location else "Remote"
    skills = profile.skills if profile and profile.skills else []
    bio = profile.bio if profile and profile.bio else "No bio available."
    exp = profile.experience_years if profile and profile.experience_years else "1 Year Exp"
    if exp and not exp.lower().endswith("exp") and not exp.lower().endswith("years"):
        exp = f"{exp} Years Exp"
        
    return {
        "id": str(user.id),
        "name": full_name,
        "headline": headline,
        "location": location,
        "experience": exp,
        "matchScore": 90,
        "skills": skills,
        "bio": bio,
        "color": avatar_color,
        "initials": "".join([n[0] for n in full_name.split() if n])[:2].upper() if full_name else "C",
        "email": user.email
    }

def format_profile_dict(profile) -> dict:
    if not profile:
        return {}
    return {
        "id": str(profile.id) if profile.id else None,
        "userId": str(profile.user_id) if profile.user_id else None,
        "fullName": profile.full_name or "",
        "full_name": profile.full_name or "",
        "headline": profile.headline or "",
        "bio": profile.bio or "",
        "location": profile.location or "",
        "phone": profile.phone or "",
        "skills": profile.skills or [],
        "experiences": profile.experiences or [],
        "socialLinks": profile.social_links or [],
        "social_links": profile.social_links or [],
        "githubUrl": profile.github_url or "",
        "linkedinUrl": profile.linkedin_url or "",
        "portfolioUrl": profile.portfolio_url or "",
        "profileCompletion": profile.profile_completion or "10%"
    }

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user), user_service: UserService = Depends(get_user_service)):
    profile = await user_service.get_profile(current_user["id"])
    return format_profile_dict(profile)

@router.put("/profile")
@router.patch("/profile")
async def update_profile(
    body: dict,
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    key_mapping = {
        "fullName": "full_name",
        "socialLinks": "social_links",
        "githubUrl": "github_url",
        "linkedinUrl": "linkedin_url",
        "portfolioUrl": "portfolio_url",
        "profileCompletion": "profile_completion"
    }
    payload = {}
    for k, v in body.items():
        db_key = key_mapping.get(k, k)
        payload[db_key] = v

    profile = await user_service.update_profile(current_user["id"], payload)
    return format_profile_dict(profile)

@router.post("/resume/upload")
async def upload_resume():
    pass

@router.get("/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user), user_service: UserService = Depends(get_user_service)):
    return await user_service.get_dashboard_stats(current_user["id"])

@router.get("/candidates")
async def get_candidates(
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=403, detail="Recruiter access required")
    candidates = await user_service.get_candidates()
    return [format_candidate(c) for c in candidates]

@router.get("/")
async def list_all_users(
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    role = current_user.get("role", "job_seeker")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    from app.models.user import UserModel
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    stmt = select(UserModel).options(selectinload(UserModel.profile))
    res = await user_service.user_repo.db.execute(stmt)
    users = res.scalars().all()
    
    formatted = []
    for u in users:
        profile = u.profile
        name = profile.full_name if profile and profile.full_name else u.email.split("@")[0]
        formatted.append({
            "id": str(u.id),
            "name": name,
            "email": u.email,
            "role": u.role.upper(),
            "status": "ACTIVE" if u.is_active else "INACTIVE",
            "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else "2026-01-01",
            "applications": 5
        })
    return formatted
