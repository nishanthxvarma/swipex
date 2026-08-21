from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_application_repository, get_notification_service, get_job_repository
from app.repositories.application_repository import ApplicationRepository
from app.repositories.job_repository import JobRepository
from app.services.notification_service import NotificationService
from app.models.application import ApplicationModel, ApplicationStatus
from app.core.security import get_current_user
import uuid

router = APIRouter()

def format_application(app) -> dict:
    job = app.job
    company_name = job.company.name if job and job.company else "Tech Corp"
    title = job.title if job else "Software Engineer"
    location = job.location if job else "Remote"
    
    # logo color mapping
    colors = ["#4285F4", "#E50914", "#0668E1", "#FF9900", "#635BFF"]
    color_idx = sum(ord(c) for c in company_name) % len(colors)
    logo_color = colors[color_idx]
    
    salary_str = ""
    if job and job.salary_min and job.salary_max:
        salary_str = f"${int(job.salary_min/1000)}K - ${int(job.salary_max/1000)}K"
    elif job and job.salary_min:
        salary_str = f"${int(job.salary_min/1000)}K+"
    else:
        salary_str = "$140,000 / yr"
        
    return {
        "id": str(app.id),
        "company": company_name,
        "title": title,
        "status": app.status.value if isinstance(app.status, ApplicationStatus) else app.status,
        "date": app.applied_at.strftime("%b %d, %Y") if app.applied_at else "Today",
        "color": logo_color,
        "initials": company_name[0].upper() if company_name else "T",
        "location": location,
        "salary": salary_str,
        "notes": app.cover_letter or "Applied via SwipeX one-tap apply."
    }

@router.post("/")
async def create_application(
    app_data: dict,
    current_user: dict = Depends(get_current_user),
    app_repo: ApplicationRepository = Depends(get_application_repository),
    job_repo: JobRepository = Depends(get_job_repository),
    notif_service: NotificationService = Depends(get_notification_service)
):
    user_id = uuid.UUID(current_user["sub"])
    job_id = uuid.UUID(app_data["jobId"])

    application = ApplicationModel(
        user_id=user_id,
        job_id=job_id,
        status=ApplicationStatus.applied,
        cover_letter=app_data.get("coverLetter"),
        resume_url=app_data.get("resumeUrl"),
        ats_score=app_data.get("atsScore", 88.5)
    )

    try:
        created_app = await app_repo.create_application(application)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application already submitted for this job."
        )

    # Fetch job title
    job = await job_repo.get_by_id(job_id)
    job_title = job.title if job else "Position"

    # Trigger candidate notification
    await notif_service.create_notification(
        user_id=user_id,
        type_str="application_submitted",
        title="Application Submitted Successfully!",
        message=f"Your application for {job_title} was submitted.",
        metadata={"applicationId": str(created_app.id), "jobId": str(job_id)}
    )

    # Load relationship for formatting
    created_app.job = job
    return format_application(created_app)

@router.get("/")
async def get_applications(
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    app_repo: ApplicationRepository = Depends(get_application_repository)
):
    user_id = uuid.UUID(current_user["sub"])
    apps = await app_repo.get_user_applications(user_id=user_id, page=page, per_page=perPage)
    return [format_application(a) for a in apps]

@router.get("/{app_id}")
async def get_application(
    app_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    app_repo: ApplicationRepository = Depends(get_application_repository)
):
    user_id = uuid.UUID(current_user["sub"])
    apps = await app_repo.get_user_applications(user_id=user_id, page=1, per_page=100)
    for a in apps:
        if a.id == app_id:
            return format_application(a)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

@router.put("/{app_id}/status")
async def update_status(
    app_id: uuid.UUID,
    status_data: dict,
    current_user: dict = Depends(get_current_user),
    app_repo: ApplicationRepository = Depends(get_application_repository),
    job_repo: JobRepository = Depends(get_job_repository),
    notif_service: NotificationService = Depends(get_notification_service)
):
    new_status = status_data.get("status")
    updated_app = await app_repo.update_status(application_id=app_id, status=new_status)
    if not updated_app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    job = await job_repo.get_by_id(updated_app.job_id)
    job_title = job.title if job else "Position"

    # Trigger candidate notification based on status
    if new_status == ApplicationStatus.reviewing.value:
        notif_type = "application_viewed"
        title = "Application Viewed by Recruiter"
        msg = f"The recruitment team viewed your application for {job_title}."
    elif new_status == ApplicationStatus.interview.value:
        notif_type = "interview_scheduled"
        title = "Interview Scheduled! 🎉"
        msg = f"Great news! You have been shortlisted for an interview for {job_title}."
    elif new_status == ApplicationStatus.offer.value:
        notif_type = "application_status_changed"
        title = "Job Offer Received! 🏆"
        msg = f"Congratulations! You received an official offer for {job_title}."
    elif new_status == ApplicationStatus.rejected.value:
        notif_type = "application_status_changed"
        title = "Application Status Update"
        msg = f"Your application status for {job_title} has been updated."
    else:
        notif_type = "application_status_changed"
        title = "Application Status Update"
        msg = f"Your application status for {job_title} is now {new_status}."

    await notif_service.create_notification(
        user_id=updated_app.user_id,
        type_str=notif_type,
        title=title,
        message=msg,
        metadata={"applicationId": str(app_id), "newStatus": new_status}
    )

    updated_app.job = job
    return format_application(updated_app)
