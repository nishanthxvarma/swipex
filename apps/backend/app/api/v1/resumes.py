import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from typing import List, Optional
from app.api.deps import get_resume_service
from app.services.resume_service import ResumeService
from app.core.security import get_current_user, parse_id
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

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB limit
ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt"}

@router.post("/upload", status_code=status.HTTP_201_CREATED)
@router.post("/uploadResume", status_code=status.HTTP_201_CREATED)
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
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please upload a valid document."
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 5 MB."
        )

    user_id = parse_id(current_user["id"])
    logger.info("resume_upload_started", extra={"user_id": str(user_id), "filename": filename, "size": len(file_bytes)})

    result = await resume_service.save_and_process_resume(
        user_id=user_id,
        file_bytes=file_bytes,
        filename=filename,
        content_type=file.content_type or "application/pdf"
    )
    logger.info("resume_upload_completed", extra={"user_id": str(user_id), "resume_id": result.get("id")})
    return result

@router.get("", response_model=None)
@router.get("/", response_model=None)
@router.get("/active", response_model=None)
async def get_active_resume(
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.get_active_resume(user_id)

@router.get("/versions")
async def get_resume_versions(
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.get_versions(user_id)

@router.get("/resumeAnalytics")
async def get_resume_analytics(
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.get_analytics(user_id)

@router.get("/recommendJobs")
async def get_recommend_jobs(
    resumeId: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.recommend_jobs(user_id)

@router.post("/analyze")
@router.post("/analyzeResume")
async def analyze_resume(
    payload: dict = {},
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.analyze(user_id, payload.get("resumeId"))

@router.post("/calculateATS")
async def calculate_ats(
    payload: dict = {},
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.calculate_ats(user_id, payload.get("resumeId"))

@router.post("/matchJob")
async def match_job(
    payload: JobMatchRequestSchema,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.match_job(
        user_id=user_id,
        job_id=payload.jobId,
        job_description=payload.jobDescription
    )

@router.post("/reanalyze")
@router.post("/reanalyze/{resume_id}")
async def reanalyze_resume(
    resume_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    """
    Reprocesses active or specific resume using v2.0.0 parser and 6-pillar scoring engine.
    """
    user_id = parse_id(current_user["id"])
    return await resume_service.reanalyze_resume(user_id, resume_id)

@router.post("/setActive/{resume_id}")
async def set_active_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.set_active_version(user_id, resume_id)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    success = await resume_service.delete_version(user_id, resume_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume version not found or already deleted")
    return {"success": True, "message": "Resume version deleted successfully"}

@router.get("/{resume_id}")
async def get_resume_by_id(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
    resume_service: ResumeService = Depends(get_resume_service)
):
    user_id = parse_id(current_user["id"])
    return await resume_service.get_active_resume(user_id)
