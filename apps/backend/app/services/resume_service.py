import os
import uuid
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.models.resume import (
    ResumeModel,
    ResumeSkillModel,
    ResumeProjectModel,
    ResumeEducationModel,
    ResumeExperienceModel,
    ResumeAnalysisHistoryModel,
)
from app.repositories.resume_repository import ResumeRepository
from app.ai.resume_parser import parser_service
from app.ai.ats_engine import ats_engine
from app.ai.health_report import health_report_generator
from app.ai.suggestion_generator import suggestion_generator
from app.ai.job_matcher import job_matcher_engine
from app.ai.recommendation_engine import ai_recommendation_engine

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ResumeService:
    def __init__(self, repo: ResumeRepository):
        self.repo = repo

    async def save_and_process_resume(self, user_id: str, file_bytes: bytes, filename: str, content_type: str) -> dict:
        ext = filename.split('.')[-1].lower() if '.' in filename else "pdf"
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # 1. Parse content into structured JSON using layout-aware pipeline
        parsed_data = parser_service.parse(file_bytes, ext, filename)
        metadata = parsed_data.pop("_metadata", {})

        # 2. Compute ATS score out of 100
        ats_result = ats_engine.calculate_score(parsed_data)

        # 3. Generate Health Report
        health_report = health_report_generator.generate(parsed_data, ats_result["overallScore"])

        # 4. Generate Grounded AI Suggestions
        suggestions = suggestion_generator.generate(parsed_data)

        # Deactivate previous active resumes for this user
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        user_resumes = await self.repo.get_resumes_by_user(u_id)
        for r in user_resumes:
            r.is_active = False

        new_resume = ResumeModel(
            user_id=u_id,
            filename=unique_filename,
            original_name=filename,
            file_path=file_path,
            file_size=len(file_bytes),
            file_type=ext,
            parsed_data=parsed_data,
            ats_score=ats_result["overallScore"],
            ats_breakdown=ats_result["breakdown"],
            health_report=health_report,
            suggestions=suggestions,
            is_active=True,
            parser_version=metadata.get("parser_version", "2.0.0"),
            scoring_version=ats_result.get("scoringVersion", "2.0.0"),
            extraction_confidence=metadata.get("extraction_confidence", 1.0),
            evidence_spans=metadata.get("evidence_spans", {})
        )

        saved = await self.repo.create_resume(new_resume)

        # Record initial history
        history_entry = ResumeAnalysisHistoryModel(
            resume_id=saved.id,
            parser_version=saved.parser_version,
            scoring_version=saved.scoring_version,
            ats_score=saved.ats_score,
            ats_breakdown=saved.ats_breakdown,
            health_report=saved.health_report,
            suggestions=saved.suggestions
        )
        self.repo.db.add(history_entry)
        await self.repo.db.commit()

        all_versions = await self.repo.get_resumes_by_user(u_id)
        return self._format_resume_response(saved, all_versions)

    async def get_active_resume(self, user_id: str) -> dict:
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        active = await self.repo.get_active_resume_by_user(u_id)
        all_versions = await self.repo.get_resumes_by_user(u_id)

        if not active and all_versions:
            active = all_versions[0]
            active.is_active = True
            await self.repo.db.commit()

        if not active:
            # Clean initial empty resume state without fake Stanford fallback data
            empty_parsed = {
                "personalInfo": {
                    "name": "Applicant",
                    "email": "",
                    "phone": "",
                    "linkedin": "",
                    "github": "",
                    "portfolio": "",
                    "location": "",
                    "headline": ""
                },
                "education": [],
                "skills": {
                    "programmingLanguages": [],
                    "frameworks": [],
                    "libraries": [],
                    "databases": [],
                    "cloud": [],
                    "tools": []
                },
                "experience": [],
                "projects": [],
                "certifications": [],
                "achievements": [],
                "languages": []
            }
            ats_res = ats_engine.calculate_score(empty_parsed)
            health = health_report_generator.generate(empty_parsed, ats_res["overallScore"])
            suggs = suggestion_generator.generate(empty_parsed)

            initial_resume = ResumeModel(
                id=uuid.uuid4(),
                user_id=u_id,
                filename="initial_resume.pdf",
                original_name="Upload Your Resume.pdf",
                file_path="",
                file_size=0,
                file_type="pdf",
                parsed_data=empty_parsed,
                ats_score=ats_res["overallScore"],
                ats_breakdown=ats_res["breakdown"],
                health_report=health,
                suggestions=suggs,
                is_active=True,
                parser_version="2.0.0",
                scoring_version="2.0.0"
            )
            saved_initial = await self.repo.create_resume(initial_resume)
            all_versions = [saved_initial]
            active = saved_initial

        return self._format_resume_response(active, all_versions)

    async def get_versions(self, user_id: str) -> List[dict]:
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        resumes = await self.repo.get_resumes_by_user(u_id)
        return [self._format_version(r) for r in resumes]

    async def set_active_version(self, user_id: str, resume_id: str) -> dict:
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        r_id = UUID(resume_id) if isinstance(resume_id, str) else resume_id
        active = await self.repo.set_active(u_id, r_id)
        all_versions = await self.repo.get_resumes_by_user(u_id)
        return self._format_resume_response(active, all_versions)

    async def delete_version(self, user_id: str, resume_id: str) -> bool:
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        r_id = UUID(resume_id) if isinstance(resume_id, str) else resume_id
        return await self.repo.delete_resume(u_id, r_id)

    async def analyze(self, user_id: str, resume_id: Optional[str] = None) -> dict:
        active = await self.get_active_resume(user_id)
        return {
            "healthReport": active["healthReport"],
            "suggestions": active["suggestions"]
        }

    async def calculate_ats(self, user_id: str, resume_id: Optional[str] = None) -> dict:
        active = await self.get_active_resume(user_id)
        parsed = active["parsedData"]
        ats_res = ats_engine.calculate_score(parsed)
        return ats_res

    async def match_job(self, user_id: str, job_id: Optional[str] = None, job_description: Optional[str] = None) -> dict:
        active = await self.get_active_resume(user_id)
        parsed = active["parsedData"]
        return job_matcher_engine.match(
            parsed_data=parsed,
            job_title="Target Role",
            job_description=job_description or ""
        )

    async def recommend_jobs(self, user_id: str) -> List[dict]:
        active = await self.get_active_resume(user_id)
        parsed = active["parsedData"]
        return ai_recommendation_engine.recommend(parsed_data=parsed)

    async def reanalyze_resume(self, user_id: str, resume_id: Optional[str] = None) -> dict:
        """
        Reprocesses an existing resume with the latest parser (v2.0.0) and scoring engine without data loss.
        """
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        if resume_id:
            r_id = UUID(resume_id) if isinstance(resume_id, str) else resume_id
            resume = await self.repo.get_resume_by_id(r_id)
        else:
            resume = await self.repo.get_active_resume_by_user(u_id)

        if not resume:
            return await self.get_active_resume(user_id)

        # If original file exists, re-read and parse
        if resume.file_path and os.path.exists(resume.file_path):
            with open(resume.file_path, "rb") as f:
                file_bytes = f.read()
            parsed_data = parser_service.parse(file_bytes, resume.file_type or "pdf", resume.original_name)
        else:
            # Re-evaluate based on stored parsed data
            parsed_data = resume.parsed_data or {}

        # Re-score with deterministic 6-pillar engine
        ats_result = ats_engine.calculate_score(parsed_data)
        health_report = health_report_generator.generate(parsed_data, ats_result["overallScore"])
        suggestions = suggestion_generator.generate(parsed_data)

        # Archive old version to history
        history_entry = ResumeAnalysisHistoryModel(
            resume_id=resume.id,
            parser_version=resume.parser_version or "1.0.0",
            scoring_version=resume.scoring_version or "1.0.0",
            ats_score=resume.ats_score or 0.0,
            ats_breakdown=resume.ats_breakdown or {},
            health_report=resume.health_report or {},
            suggestions=resume.suggestions or []
        )
        self.repo.db.add(history_entry)

        # Update resume
        resume.parsed_data = parsed_data
        resume.ats_score = ats_result["overallScore"]
        resume.ats_breakdown = ats_result["breakdown"]
        resume.health_report = health_report
        resume.suggestions = suggestions
        resume.parser_version = "2.0.0"
        resume.scoring_version = ats_result.get("scoringVersion", "2.0.0")
        resume.updated_at = datetime.now(timezone.utc)

        await self.repo.db.commit()
        await self.repo.db.refresh(resume)

        all_versions = await self.repo.get_resumes_by_user(u_id)
        return self._format_resume_response(resume, all_versions)

    async def get_analytics(self, user_id: str) -> dict:
        u_id = UUID(user_id) if isinstance(user_id, str) else user_id
        resumes = await self.repo.get_resumes_by_user(u_id)
        active = await self.get_active_resume(user_id)
        parsed = active["parsedData"]
        skills = parsed.get("skills", {})

        skill_dist = [
            {"category": "Languages", "count": len(skills.get("programmingLanguages", []))},
            {"category": "Frameworks", "count": len(skills.get("frameworks", []))},
            {"category": "Libraries", "count": len(skills.get("libraries", []))},
            {"category": "Databases", "count": len(skills.get("databases", []))},
            {"category": "Cloud", "count": len(skills.get("cloud", []))},
            {"category": "Tools", "count": len(skills.get("tools", []))},
        ]

        ats_trend = []
        for r in reversed(resumes):
            date_str = r.created_at.strftime("%b %d") if r.created_at else "Today"
            ats_trend.append({
                "date": date_str,
                "score": r.ats_score or 75.0,
                "version": r.original_name[:15]
            })

        return {
            "skillDistribution": skill_dist,
            "atsTrend": ats_trend,
            "applicationsCount": len(resumes),
            "resumeImprovementRate": 15.0 if len(resumes) > 1 else 0.0,
            "jobMatchesCount": len(resumes) * 12,
            "monthlyUploads": [
                {"month": "Recent", "uploads": len(resumes)}
            ]
        }

    def _format_resume_response(self, r: ResumeModel, all_versions: List[ResumeModel]) -> dict:
        return {
            "id": str(r.id),
            "userId": str(r.user_id),
            "filename": r.filename,
            "originalName": r.original_name,
            "fileUrl": f"/api/v1/resumes/download/{r.id}",
            "fileSize": r.file_size or 0,
            "fileType": r.file_type or "pdf",
            "parsedData": r.parsed_data or {},
            "atsScore": r.ats_score or 0.0,
            "atsBreakdown": r.ats_breakdown or {},
            "healthReport": r.health_report or {},
            "suggestions": r.suggestions or [],
            "isActive": r.is_active,
            "uploadedAt": r.created_at.isoformat() if r.created_at else datetime.now(timezone.utc).isoformat(),
            "versions": [self._format_version(v) for v in all_versions]
        }

    def _format_version(self, r: ResumeModel) -> dict:
        return {
            "id": str(r.id),
            "userId": str(r.user_id),
            "filename": r.filename,
            "originalName": r.original_name,
            "fileSize": r.file_size or 0,
            "fileType": r.file_type or "pdf",
            "atsScore": r.ats_score or 0.0,
            "isActive": r.is_active,
            "uploadedAt": r.created_at.isoformat() if r.created_at else datetime.now(timezone.utc).isoformat()
        }
