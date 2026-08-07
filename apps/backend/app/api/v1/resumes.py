from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from fastapi.responses import FileResponse
from typing import List, Optional
from app.api.deps import get_resume_service
from app.services.resume_service import ResumeService
from app.core.security import get_current_user
from app.schemas.resume import (
    ActiveResumeResponseSchema,
    ATSScoreResponseSchema,
    HealthReportSchema,
    SuggestionSchema,
    JobMatchRequestSchema,
    JobMatchResultSchema,
    SkillGapAnalysisSchema,
    JobRecommendationSchema,
    ResumeVersionSchema,
    ResumeAnalyticsSchema,
)

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit
ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}

@router.post("/uploadResume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    if not current_user or not current_user.get("id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    filename = file.filename or "resume.pdf"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Supported formats: PDF, DOCX, TXT."
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 5 MB."
        )

    result = await resume_service.save_and_process_resume(
        user_id=current_user["id"],
        file_bytes=file_bytes,
        filename=filename,
        content_type=file.content_type or "application/pdf"
    )
    return result

@router.get("/active")
async def get_active_resume(
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.get_active_resume(current_user["id"])

@router.get("/versions")
async def get_resume_versions(
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.get_versions(current_user["id"])

@router.get("/resumeAnalytics")
async def get_resume_analytics(
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.get_analytics(current_user["id"])

@router.get("/recommendJobs")
async def get_recommend_jobs(
    resumeId: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.recommend_jobs(current_user["id"])

@router.post("/analyzeResume")
async def analyze_resume(
    payload: dict = {},
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.analyze(current_user["id"], payload.get("resumeId"))

@router.post("/calculateATS")
async def calculate_ats(
    payload: dict = {},
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.calculate_ats(current_user["id"], payload.get("resumeId"))

@router.post("/matchJob")
async def match_job(
    payload: JobMatchRequestSchema,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.match_job(
        user_id=current_user["id"],
        job_id=payload.jobId,
        job_description=payload.jobDescription
    )

@router.post("/setActive/{resume_id}")
async def set_active_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.set_active_version(current_user["id"], resume_id)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    success = await resume_service.delete_version(current_user["id"], resume_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume version not found or already deleted")
    return {"success": True, "message": "Resume version deleted successfully"}

@router.get("/{resume_id}")
async def get_resume_by_id(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    return await resume_service.get_active_resume(current_user["id"])
