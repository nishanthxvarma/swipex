from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_job_service, get_competition_service, get_notification_service, get_user_service
from app.services.job_service import JobService
from app.services.competition_service import CompetitionService
from app.services.notification_service import NotificationService
from app.services.user_service import UserService
from app.core.security import get_current_user, parse_id
from app.schemas.competition import CompetitionIndicatorSchema
import uuid

router = APIRouter()

def get_color_for_company(name: str) -> str:
    colors = ["#635BFF", "#FF5A5F", "#000000", "#5E6AD2", "#1DB954", "#F24E1E", "#3B82F6", "#10B981", "#8B5CF6"]
    if not name:
        return colors[0]
    idx = sum(ord(c) for c in name) % len(colors)
    return colors[idx]

def calculate_match_percentage(user_skills: list, job_skills: list) -> int:
    if not job_skills:
        return 80
    if not user_skills:
        return 60
    u_skills = {s.lower().strip() for s in user_skills}
    j_skills = {s.lower().strip() for s in job_skills}
    overlap = u_skills.intersection(j_skills)
    jaccard = len(overlap) / len(j_skills)
    score = 60 + int(jaccard * 40)
    return min(100, max(50, score))

def format_job(job, user_skills: list = None) -> dict:
    company_name = job.company.name if job.company else "SwipeX Partner"
    rating = job.company.rating if job.company and job.company.rating else 4.5
    logo_color = get_color_for_company(company_name)
    
    req_list = []
    if job.requirements:
        if isinstance(job.requirements, str):
            req_list = [r.strip() for r in job.requirements.split("\n") if r.strip()]
        elif isinstance(job.requirements, list):
            req_list = job.requirements
            
    benefits_list = []
    if job.benefits:
        if isinstance(job.benefits, str):
            benefits_list = [b.strip() for b in job.benefits.split("\n") if b.strip()]
        elif isinstance(job.benefits, list):
            benefits_list = job.benefits

    skills_req = job.skills_required if job.skills_required else []
    skills_pref = job.skills_preferred if job.skills_preferred else []
    
    salary_str = ""
    if job.salary_min and job.salary_max:
        salary_str = f"${int(job.salary_min/1000)}K - ${int(job.salary_max/1000)}K"
    elif job.salary_min:
        salary_str = f"${int(job.salary_min/1000)}K+"
    else:
        salary_str = "$120K - $160K"
        
    match_pct = calculate_match_percentage(user_skills, skills_req)
        
    return {
        "id": str(job.id),
        "companyId": str(job.company_id) if job.company_id else None,
        "title": job.title,
        "description": job.description or "",
        "requirements": req_list,
        "salaryMin": job.salary_min,
        "salaryMax": job.salary_max,
        "salaryCurrency": job.salary_currency or "USD",
        "location": job.location or "Remote",
        "isRemote": job.is_remote or False,
        "jobType": job.job_type.value if job.job_type else "full_time",
        "experienceLevel": job.experience_level.value if job.experience_level else "mid",
        "skillsRequired": skills_req,
        "skillsPreferred": skills_pref,
        "benefits": benefits_list,
        "isActive": job.is_active if job.is_active is not None else True,
        "viewsCount": job.views_count or 0,
        "applicationsCount": job.applications_count or 0,
        "postedAt": job.posted_at.isoformat() if job.posted_at else None,
        
        # UI format helpers
        "company": company_name,
        "companyInitials": company_name[0].upper() if company_name else "S",
        "verified": rating >= 4.7,
        "color": logo_color,
        "salary": salary_str,
        "skills": skills_req or ["React", "TypeScript"],
        "matchPercentage": match_pct,
        "atsScore": match_pct,
        "competition": "High" if (job.applications_count or 0) > 30 else "Medium" if (job.applications_count or 0) > 10 else "Low",
        "postedTime": "2 hours ago"
    }

@router.get("/")
async def list_jobs(
    page: int = Query(1, ge=1),
    perPage: int = Query(10, ge=1, le=50),
    job_service: JobService = Depends(get_job_service)
):
    jobs = await job_service.list_jobs(page=page, per_page=perPage)
    return [format_job(j) for j in jobs]

@router.get("/feed")
async def get_feed(
    page: int = Query(1, ge=1),
    perPage: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
    user_service: UserService = Depends(get_user_service)
):
    user_id = parse_id(current_user["sub"])
    jobs = await job_service.get_feed(user_id=user_id, page=page, per_page=perPage)
    
    # Fetch user skills for rules-based match calculation
    user_skills = []
    profile = await user_service.get_profile(user_id)
    if profile and profile.skills:
        user_skills = profile.skills
        
    return [format_job(j, user_skills) for j in jobs]

@router.get("/{job_id}/competition", response_model=CompetitionIndicatorSchema)
async def get_job_competition(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    competition_service: CompetitionService = Depends(get_competition_service),
):
    user_id = parse_id(current_user["sub"])
    return await competition_service.get_job_competition(job_id=parse_id(job_id), user_id=user_id)

@router.get("/{job_id}")
async def get_job(
    job_id: str, 
    job_service: JobService = Depends(get_job_service),
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    job = await job_service.get_job_detail(parse_id(job_id))
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        
    user_id = uuid.UUID(current_user["sub"])
    user_skills = []
    profile = await user_service.get_profile(user_id)
    if profile and profile.skills:
        user_skills = profile.skills
        
    return format_job(job, user_skills)

@router.post("/")
async def create_job(
    job_data: dict,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter access required")
    # Adapt dictionary keys to JobModel fields
    title = job_data.get("title")
    description = job_data.get("description")
    company_id = job_data.get("companyId")
    if company_id:
        company_id = uuid.UUID(company_id)
    else:
        # Fetch the first company in database as default
        from sqlalchemy import select
        from app.models.job import CompanyModel
        stmt = select(CompanyModel).limit(1)
        res = await job_service.job_repo.db.execute(stmt)
        c = res.scalars().first()
        if c:
            company_id = c.id
    
    from app.models.job import JobModel
    job = JobModel(
        title=title, 
        description=description, 
        company_id=company_id,
        location=job_data.get("location", "Remote"),
        salary_min=float(job_data.get("salaryMin", 100000)),
        salary_max=float(job_data.get("salaryMax", 150000)),
        skills_required=job_data.get("skillsRequired", ["React"]),
        requirements=job_data.get("requirements", "")
    )
    res = await job_service.job_repo.create(job)
    return format_job(res)

@router.post("/{job_id}/swipe")
async def swipe_job(
    job_id: str,
    direction: str = Query("right", regex="^(left|right|up)$"),
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
    notif_service: NotificationService = Depends(get_notification_service)
):
    user_id = parse_id(current_user["sub"])
    res = await job_service.swipe_job(user_id=user_id, job_id=parse_id(job_id), direction=direction)
    return res

@router.post("/{job_id}/save")
async def save_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
    notif_service: NotificationService = Depends(get_notification_service)
):
    user_id = parse_id(current_user["sub"])
    res = await job_service.save_job(user_id=user_id, job_id=parse_id(job_id))
    
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
    job_id: str,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    user_id = parse_id(current_user["sub"])
    return await job_service.unsave_job(user_id=user_id, job_id=parse_id(job_id))

@router.get("/saved")
async def get_saved_jobs(
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    user_id = parse_id(current_user["sub"])
    saved = await job_service.get_saved_jobs(user_id=user_id)
    # format jobs inside SavedJobModel list
    formatted_saved = []
    for s in saved:
        formatted_saved.append({
            "id": str(s.id),
            "userId": str(s.user_id),
            "jobId": str(s.job_id),
            "savedAt": s.saved_at.isoformat() if s.saved_at else None,
            "job": format_job(s.job) if s.job else None
        })
    return formatted_saved
