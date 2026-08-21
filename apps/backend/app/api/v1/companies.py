from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
import uuid

from app.core.security import get_current_user
from app.api.deps import get_company_repository
from app.repositories.company_repository import CompanyRepository
from app.models.job import CompanyModel

router = APIRouter()

def format_company(c: CompanyModel, include_jobs: bool = False) -> dict:
    colors = ["#4285F4", "#0F9D58", "#F4B400", "#DB4437", "#635BFF", "#8B5CF6"]
    color_idx = sum(ord(ch) for ch in c.name) % len(colors)
    
    jobs_attr = c.__dict__.get("jobs")
    active_jobs = [j for j in jobs_attr if j.is_active] if isinstance(jobs_attr, list) else []

    res = {
        "id": str(c.id),
        "name": c.name,
        "industry": c.industry or "Technology",
        "size": c.size or "50-200",
        "website": c.website or f"https://{c.name.lower().replace(' ', '')}.com",
        "description": c.description or f"{c.name} is an innovative organization building world-class technology solutions.",
        "culture": c.culture or "Collaborative, mission-driven, and high-velocity engineering.",
        "benefits": c.benefits or ["Health Insurance", "Remote Flexibility", "Learning Stipend", "401(k) Matching"],
        "techStack": c.tech_stack or ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL"],
        "rating": c.rating or 4.8,
        "employeeCount": c.employee_count or 150,
        "foundedYear": c.founded_year or 2020,
        "headquarters": c.headquarters or "San Francisco, CA",
        "location": c.headquarters or "San Francisco, CA",
        "logoUrl": c.logo_url,
        "color": colors[color_idx],
        "initials": "".join([part[0] for part in c.name.split() if part])[:2].upper(),
        "openRolesCount": len(active_jobs),
        "activeJobsCount": len(active_jobs)
    }

    if include_jobs:
        res["jobs"] = [
            {
                "id": str(j.id),
                "title": j.title,
                "description": j.description,
                "location": j.location or "Remote",
                "isRemote": j.is_remote,
                "jobType": j.job_type.value if hasattr(j.job_type, "value") else str(j.job_type),
                "salary": f"${int(j.salary_min/1000)}k - ${int(j.salary_max/1000)}k" if (j.salary_min and j.salary_max) else "$120,000 - $160,000",
                "skills": j.skills_required or []
            }
            for j in active_jobs
        ]
    return res

@router.get("/")
async def list_companies(
    query: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100),
    company_repo: CompanyRepository = Depends(get_company_repository)
):
    companies = await company_repo.list_companies(
        query=query,
        industry=industry,
        location=location,
        page=page,
        per_page=perPage
    )
    return [format_company(c) for c in companies]

@router.get("/{company_id}")
async def get_company(
    company_id: uuid.UUID,
    company_repo: CompanyRepository = Depends(get_company_repository)
):
    company = await company_repo.get_by_id(company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return format_company(company, include_jobs=True)

@router.post("/")
async def create_company(
    company_data: dict,
    current_user: dict = Depends(get_current_user),
    company_repo: CompanyRepository = Depends(get_company_repository)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter or Admin access required to create company profile."
        )

    company = CompanyModel(
        name=company_data["name"],
        industry=company_data.get("industry", "Technology"),
        size=company_data.get("size", "50-200"),
        website=company_data.get("website"),
        description=company_data.get("description"),
        tech_stack=company_data.get("techStack") or company_data.get("tech_stack", []),
        culture=company_data.get("culture"),
        benefits=company_data.get("benefits", []),
        rating=float(company_data.get("rating", 4.8)),
        employee_count=int(company_data.get("employeeCount") or company_data.get("employee_count", 100)),
        headquarters=company_data.get("headquarters") or company_data.get("location", "Remote")
    )
    created = await company_repo.create(company)
    return format_company(created)

@router.put("/{company_id}")
async def update_company(
    company_id: uuid.UUID,
    company_data: dict,
    current_user: dict = Depends(get_current_user),
    company_repo: CompanyRepository = Depends(get_company_repository)
):
    role = current_user.get("role", "job_seeker")
    if role not in ("recruiter", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter or Admin access required to update company profile."
        )

    company = await company_repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    for key, val in company_data.items():
        attr = "tech_stack" if key == "techStack" else ("employee_count" if key == "employeeCount" else key)
        if hasattr(company, attr) and val is not None:
            setattr(company, attr, val)

    updated = await company_repo.update(company)
    return format_company(updated)
