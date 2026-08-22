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
    company = job.__dict__.get("company") if hasattr(job, "__dict__") else getattr(job, "company", None)
    company_name = company.name if company and hasattr(company, "name") else "SwipeX Partner"
    rating = company.rating if company and hasattr(company, "rating") and company.rating else 4.5
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
        
    user_id = parse_id(current_user["sub"])
    user_skills = []
    profile = await user_service.get_profile(user_id)
    if profile and profile.skills:
        user_skills = profile.skills
        
    return format_job(job, user_skills)

@router.get("/recruiter/mine")
@router.get("/recruiter/list")
async def list_recruiter_jobs_endpoint(
    page: int = Query(1, ge=1),
    perPage: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter access required")
    user_id = parse_id(current_user["sub"])
    jobs = await job_service.list_recruiter_jobs(recruiter_id=user_id, page=page, per_page=perPage)
    
    # Calculate real applicant counts per job
    from app.models.application import ApplicationModel
    from sqlalchemy import select, func
    res_list = []
    for j in jobs:
        cnt_stmt = select(func.count(ApplicationModel.id)).where(ApplicationModel.job_id == j.id)
        cnt_res = await job_service.job_repo.db.execute(cnt_stmt)
        app_count = cnt_res.scalar_one() or 0
        j.applications_count = app_count
        res_list.append(format_job(j))
    return res_list

@router.post("/")
async def create_job(
    job_data: dict,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service),
    notif_service: NotificationService = Depends(get_notification_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter access required to post jobs")
    user_id = parse_id(current_user["sub"])
    
    title = str(job_data.get("title") or "").strip()
    if not title:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Job title is required")
    
    description = str(job_data.get("description") or "").strip()
    if not description:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role description is required")
        
    department = str(job_data.get("department") or "Engineering").strip()
    
    # Resolve company name & company entity
    company_name_input = str(
        job_data.get("companyName") or job_data.get("company") or job_data.get("company_name") or ""
    ).strip()
    
    company_id = job_data.get("companyId") or job_data.get("company_id")
    resolved_company = None
    
    from sqlalchemy import select
    from app.models.job import CompanyModel, JobModel, JobTypeEnum, ExperienceLevelEnum
    
    if company_id:
        company_id = parse_id(company_id)
        stmt = select(CompanyModel).where(CompanyModel.id == company_id)
        res = await job_service.job_repo.db.execute(stmt)
        resolved_company = res.scalars().first()
    elif company_name_input:
        stmt = select(CompanyModel).where(CompanyModel.name.ilike(company_name_input))
        res = await job_service.job_repo.db.execute(stmt)
        resolved_company = res.scalars().first()
        if not resolved_company:
            # Create new company record
            resolved_company = CompanyModel(
                name=company_name_input,
                description=f"{company_name_input} is an innovative organization.",
                industry=department or "Technology",
                website=f"https://{company_name_input.lower().replace(' ', '')}.com",
                headquarters=str(job_data.get("location") or "Remote").strip()
            )
            job_service.job_repo.db.add(resolved_company)
            await job_service.job_repo.db.flush()
        company_id = resolved_company.id
    else:
        # Fallback to first existing company or create default
        stmt = select(CompanyModel).limit(1)
        res = await job_service.job_repo.db.execute(stmt)
        resolved_company = res.scalars().first()
        if not resolved_company:
            resolved_company = CompanyModel(
                name="SwipeX Partner",
                description="Next-generation partner company.",
                industry="Technology",
                website="https://swipexai.vercel.app"
            )
            job_service.job_repo.db.add(resolved_company)
            await job_service.job_repo.db.flush()
        company_id = resolved_company.id

    # Skills normalization & deduplication
    raw_skills = job_data.get("skillsRequired") or job_data.get("skills_required") or job_data.get("skills") or []
    if isinstance(raw_skills, str):
        raw_list = [s.strip() for s in raw_skills.split(",") if s.strip()]
    elif isinstance(raw_skills, list):
        raw_list = [str(s).strip() for s in raw_skills if str(s).strip()]
    else:
        raw_list = []
        
    seen = set()
    skills_req = []
    for s in raw_list:
        clean = s.strip()
        if clean and clean.lower() not in seen:
            seen.add(clean.lower())
            skills_req.append(clean)
        
    if not skills_req:
        skills_req = ["General"]
    
    # Normalize salary
    salary_min = job_data.get("salaryMin") or job_data.get("salary_min") or job_data.get("min_salary") or 0
    salary_max = job_data.get("salaryMax") or job_data.get("salary_max") or job_data.get("max_salary") or 0
    try:
        salary_min = float(salary_min)
    except (ValueError, TypeError):
        salary_min = 0.0
    try:
        salary_max = float(salary_max)
    except (ValueError, TypeError):
        salary_max = salary_min if salary_min > 0 else 0.0

    if salary_min < 0 or salary_max < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Salary cannot be negative"
        )

    if salary_max > 0 and salary_min > 0 and salary_min > salary_max:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Minimum salary cannot exceed maximum salary"
        )

    # Job type & experience level validation/fallback
    raw_job_type = str(job_data.get("jobType") or job_data.get("job_type") or "full_time").lower().strip()
    try:
        job_type_enum = JobTypeEnum(raw_job_type)
    except ValueError:
        job_type_enum = JobTypeEnum.full_time

    raw_exp = str(job_data.get("experienceLevel") or job_data.get("experience_level") or "mid").lower().strip()
    try:
        exp_enum = ExperienceLevelEnum(raw_exp)
    except ValueError:
        exp_enum = ExperienceLevelEnum.mid

    job = JobModel(
        title=title, 
        description=description, 
        company_id=company_id,
        recruiter_id=user_id,
        location=str(job_data.get("location", "Remote")).strip() or "Remote",
        salary_min=salary_min,
        salary_max=salary_max,
        salary_currency=str(job_data.get("salaryCurrency", "USD")),
        job_type=job_type_enum,
        experience_level=exp_enum,
        skills_required=skills_req,
        skills_preferred=job_data.get("skillsPreferred") or job_data.get("skills_preferred") or [],
        requirements=job_data.get("requirements", ""),
        is_remote=bool(job_data.get("isRemote", False) or "remote" in str(job_data.get("location", "")).lower()),
        is_active=True
    )
    res = await job_service.job_repo.create(job)
    
    # Attach resolved company for immediate accurate serialization
    if resolved_company:
        res.company = resolved_company
        
    # Create persistent job opportunity notifications for active job seekers
    try:
        from app.models.user import UserModel, RoleEnum
        stmt = select(UserModel.id).where(
            UserModel.role == RoleEnum.job_seeker,
            UserModel.is_active == True
        )
        seekers_res = await job_service.job_repo.db.execute(stmt)
        seeker_ids = seekers_res.scalars().all()
        
        comp_display = resolved_company.name if resolved_company else "SwipeX Partner"
        notif_title = "New job opportunity"
        notif_message = f"{res.title} at {comp_display} is now available."
        notif_meta = {
            "jobId": str(res.id),
            "company": comp_display,
            "title": res.title
        }
        
        for s_id in seeker_ids:
            await notif_service.create_notification(
                user_id=s_id,
                type_str="job_recommendation",
                title=notif_title,
                message=notif_message,
                metadata=notif_meta
            )
    except Exception:
        # Prevent non-fatal notification issue from failing job creation response
        pass

    return format_job(res)

@router.put("/{job_id}/status")
@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: str,
    status_data: dict,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter access required")
    
    job = await job_service.get_job_detail(parse_id(job_id))
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    is_active = status_data.get("isActive")
    if is_active is None:
        st = status_data.get("status", "").lower()
        is_active = (st == "active")
    
    job.is_active = bool(is_active)
    await job_service.job_repo.update(job)
    return format_job(job)

@router.delete("/{job_id}")
async def delete_job_endpoint(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    job_service: JobService = Depends(get_job_service)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter access required")
    
    await job_service.job_repo.delete(job_id)
    return {"success": True, "deletedId": job_id}

@router.post("/{job_id}/swipe")
async def swipe_job(
    job_id: str,
    direction: str = Query("right", pattern="^(left|right|up)$"),
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
