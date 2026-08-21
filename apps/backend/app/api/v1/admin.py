from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from typing import Optional, List
import uuid

from app.core.security import get_current_user, parse_id
from app.api.deps import get_user_service, get_audit_service
from app.services.user_service import UserService
from app.services.audit_service import AuditService
from app.models.user import UserModel, ProfileModel
from app.models.job import CompanyModel, JobModel
from app.models.notification import AuditLogModel

router = APIRouter()

def verify_admin_role(current_user: dict):
    role = current_user.get("role", "job_seeker")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for platform governance."
        )

@router.get("/recruiters")
async def list_recruiters(
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    verify_admin_role(current_user)

    stmt = select(UserModel).options(selectinload(UserModel.profile)).where(UserModel.role == "recruiter")
    res = await user_service.user_repo.db.execute(stmt)
    recruiters = res.scalars().all()

    recruiter_list = []
    for r in recruiters:
        profile = r.profile
        company_name = profile.headline if profile and profile.headline else (profile.full_name or "Partner Employer")
        
        # Determine status
        if not r.is_active:
            rec_status = "SUSPENDED"
        elif r.is_verified:
            rec_status = "VERIFIED"
        else:
            rec_status = "PENDING"

        recruiter_list.append({
            "id": str(r.id),
            "company": company_name,
            "email": r.email,
            "status": rec_status,
            "isVerified": r.is_verified,
            "isActive": r.is_active,
            "postsQuota": 25,
            "activeJobs": 12
        })

    return recruiter_list

@router.put("/recruiters/{recruiter_id}/verify")
async def toggle_recruiter_verification(
    recruiter_id: str,
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    verify_admin_role(current_user)

    recruiter = await user_service.user_repo.get_by_id(parse_id(recruiter_id))
    if not recruiter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter not found")

    recruiter.is_verified = not recruiter.is_verified
    user_service.user_repo.db.add(recruiter)
    await user_service.user_repo.db.commit()
    await user_service.user_repo.db.refresh(recruiter)

    # Record Audit Log
    action_type = "RECRUITER_VERIFIED" if recruiter.is_verified else "RECRUITER_UNVERIFIED"
    await audit_service.log_event(
        action=action_type,
        resource_type="RECRUITER",
        user_id=parse_id(current_user["id"]),
        resource_id=str(recruiter_id),
        metadata={"email": recruiter.email, "is_verified": recruiter.is_verified}
    )

    return {
        "success": True,
        "id": str(recruiter.id),
        "isVerified": recruiter.is_verified,
        "status": "VERIFIED" if recruiter.is_verified else "PENDING"
    }

@router.put("/recruiters/{recruiter_id}/status")
async def toggle_recruiter_status(
    recruiter_id: str,
    status_data: dict,
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    verify_admin_role(current_user)

    recruiter = await user_service.user_repo.get_by_id(parse_id(recruiter_id))
    if not recruiter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruiter not found")

    new_status = status_data.get("status", "").upper()
    if new_status == "SUSPENDED":
        recruiter.is_active = False
    elif new_status in ("ACTIVE", "VERIFIED"):
        recruiter.is_active = True

    user_service.user_repo.db.add(recruiter)
    await user_service.user_repo.db.commit()
    await user_service.user_repo.db.refresh(recruiter)

    # Record Audit Log
    await audit_service.log_event(
        action="RECRUITER_SUSPENDED" if not recruiter.is_active else "RECRUITER_ACTIVATED",
        resource_type="RECRUITER",
        user_id=parse_id(current_user["id"]),
        resource_id=str(recruiter_id),
        metadata={"email": recruiter.email, "is_active": recruiter.is_active}
    )

    return {
        "success": True,
        "id": str(recruiter.id),
        "isActive": recruiter.is_active,
        "status": "SUSPENDED" if not recruiter.is_active else ("VERIFIED" if recruiter.is_verified else "PENDING")
    }

@router.get("/users")
async def list_admin_users(
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    verify_admin_role(current_user)

    stmt = select(UserModel).options(selectinload(UserModel.profile)).order_by(desc(UserModel.created_at))
    res = await user_service.user_repo.db.execute(stmt)
    users = res.scalars().all()

    formatted = []
    for u in users:
        profile = u.profile
        name = profile.full_name if (profile and profile.full_name) else u.email.split("@")[0]
        formatted.append({
            "id": str(u.id),
            "name": name,
            "email": u.email,
            "role": u.role.upper() if hasattr(u.role, "upper") else str(u.role).upper(),
            "status": "ACTIVE" if u.is_active else "INACTIVE",
            "isVerified": u.is_verified,
            "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else "2026-01-01",
            "applications": 5
        })
    return formatted

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_data: dict,
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    verify_admin_role(current_user)

    target_user = await user_service.user_repo.get_by_id(parse_id(user_id))
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    is_active = status_data.get("isActive") if "isActive" in status_data else (status_data.get("status", "").upper() == "ACTIVE")
    target_user.is_active = is_active
    user_service.user_repo.db.add(target_user)
    await user_service.user_repo.db.commit()
    await user_service.user_repo.db.refresh(target_user)

    # Record Audit Log
    await audit_service.log_event(
        action="USER_STATUS_UPDATED",
        resource_type="USER",
        user_id=parse_id(current_user["id"]),
        resource_id=str(user_id),
        metadata={"email": target_user.email, "is_active": target_user.is_active}
    )

    return {
        "success": True,
        "id": str(target_user.id),
        "isActive": target_user.is_active,
        "status": "ACTIVE" if target_user.is_active else "INACTIVE"
    }

@router.get("/activity")
async def get_admin_activity(
    type: Optional[str] = Query("ALL"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    audit_service: AuditService = Depends(get_audit_service)
):
    verify_admin_role(current_user)

    offset = (page - 1) * limit
    logs = await audit_service.get_activity_logs(event_type=type, limit=limit, offset=offset)

    formatted_logs = []
    for l in logs:
        action_name = l.action or "SYSTEM_EVENT"
        severity = "HIGH" if "SUSPEND" in action_name or "FAIL" in action_name or "SECURITY" in action_name else "INFO"
        formatted_logs.append({
            "id": str(l.id),
            "type": l.resource_type or "SYSTEM",
            "action": l.action,
            "message": f"{l.action}: {l.resource_type} (Target ID: {l.resource_id or 'Global'})",
            "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else "Just now",
            "severity": severity,
            "metadata": l.metadata_json or {}
        })

    return formatted_logs
