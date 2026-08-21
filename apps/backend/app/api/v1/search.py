from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, or_, func, distinct
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.job import JobModel, CompanyModel
from app.models.user import UserModel, ProfileModel

router = APIRouter()

@router.get("/")
async def global_search(
    q: str = Query(..., min_length=1),
    category: Optional[str] = Query("all"),
    location: Optional[str] = Query(None),
    remote: Optional[bool] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user)
):
    search_term = f"%{q.strip()}%"
    results: Dict[str, Any] = {
        "query": q,
        "jobs": [],
        "companies": [],
        "candidates": [],
        "totalResults": 0
    }

    # 1. Search Jobs
    if category in ("all", "jobs"):
        job_stmt = select(JobModel).options(
            joinedload(JobModel.company)
        ).where(
            JobModel.is_active == True,
            or_(
                JobModel.title.ilike(search_term),
                JobModel.description.ilike(search_term),
                JobModel.requirements.ilike(search_term),
                JobModel.location.ilike(search_term)
            )
        )
        if location:
            job_stmt = job_stmt.where(JobModel.location.ilike(f"%{location}%"))
        if remote is not None:
            job_stmt = job_stmt.where(JobModel.is_remote == remote)
        
        job_stmt = job_stmt.limit(limit).offset((page - 1) * limit)
        job_res = await db.execute(job_stmt)
        jobs = job_res.scalars().all()

        for j in jobs:
            comp_name = j.company.name if j.company else "SwipeX Partner"
            salary_str = f"${int(j.salary_min/1000)}k - ${int(j.salary_max/1000)}k" if (j.salary_min and j.salary_max) else "$120,000 - $160,000"
            results["jobs"].append({
                "id": str(j.id),
                "title": j.title,
                "company": comp_name,
                "companyInitials": comp_name[:2].upper(),
                "location": j.location or "Remote",
                "isRemote": j.is_remote,
                "salary": salary_str,
                "type": j.job_type.value if hasattr(j.job_type, "value") else str(j.job_type),
                "skills": j.skills_required or [],
                "matchPercentage": 88
            })

    # 2. Search Companies
    if category in ("all", "companies"):
        comp_stmt = select(CompanyModel).where(
            or_(
                CompanyModel.name.ilike(search_term),
                CompanyModel.industry.ilike(search_term),
                CompanyModel.description.ilike(search_term),
                CompanyModel.headquarters.ilike(search_term)
            )
        ).limit(limit).offset((page - 1) * limit)
        comp_res = await db.execute(comp_stmt)
        companies = comp_res.scalars().all()

        colors = ["#4285F4", "#0F9D58", "#F4B400", "#DB4437", "#635BFF", "#8B5CF6"]
        for c in companies:
            c_idx = sum(ord(ch) for ch in c.name) % len(colors)
            results["companies"].append({
                "id": str(c.id),
                "name": c.name,
                "industry": c.industry or "Technology",
                "size": c.size or "50-200",
                "location": c.headquarters or "Remote",
                "rating": c.rating or 4.8,
                "color": colors[c_idx],
                "initials": "".join([p[0] for p in c.name.split() if p])[:2].upper(),
                "description": c.description
            })

    # 3. Search Candidates (only recruiters and admins)
    user_role = current_user.get("role", "job_seeker") if current_user else "job_seeker"
    if category in ("all", "candidates") and user_role in ("recruiter", "admin"):
        cand_stmt = select(UserModel).options(
            selectinload(UserModel.profile)
        ).join(
            ProfileModel, UserModel.id == ProfileModel.user_id, isouter=True
        ).where(
            UserModel.role == "job_seeker",
            UserModel.is_active == True,
            or_(
                UserModel.email.ilike(search_term),
                ProfileModel.full_name.ilike(search_term),
                ProfileModel.headline.ilike(search_term),
                ProfileModel.bio.ilike(search_term),
                ProfileModel.location.ilike(search_term)
            )
        ).limit(limit).offset((page - 1) * limit)

        cand_res = await db.execute(cand_stmt)
        candidates = cand_res.scalars().all()

        for cand in candidates:
            p = cand.profile
            name = p.full_name if (p and p.full_name) else cand.email.split("@")[0]
            results["candidates"].append({
                "id": str(cand.id),
                "name": name,
                "headline": p.headline if p else "Software Engineer",
                "location": p.location if p else "Remote",
                "skills": p.skills if (p and p.skills) else ["TypeScript", "React", "Python"],
                "experienceYears": p.experience_years if p else 3,
                "profileCompletion": p.profile_completion if p else "70%"
            })

    results["totalResults"] = len(results["jobs"]) + len(results["companies"]) + len(results["candidates"])
    return results

@router.get("/suggestions")
async def search_suggestions(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    search_term = f"%{q.strip()}%"
    
    # Suggest job titles
    job_titles_res = await db.execute(
        select(distinct(JobModel.title)).where(
            JobModel.title.ilike(search_term),
            JobModel.is_active == True
        ).limit(5)
    )
    job_titles = [t for t in job_titles_res.scalars().all() if t]

    # Suggest company names
    company_names_res = await db.execute(
        select(distinct(CompanyModel.name)).where(
            CompanyModel.name.ilike(search_term)
        ).limit(5)
    )
    company_names = [c for c in company_names_res.scalars().all() if c]

    # Combine unique suggestions
    suggestions = list(dict.fromkeys(job_titles + company_names))[:8]
    return suggestions
