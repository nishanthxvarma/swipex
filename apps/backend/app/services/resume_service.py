import os
import uuid
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.models.resume import ResumeModel
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

        # 1. Parse content into structured JSON
        parsed_data = parser_service.parse(file_bytes, ext, filename)

        # 2. Compute ATS score out of 100
        ats_result = ats_engine.calculate_score(parsed_data)

        # 3. Generate Health Report
        health_report = health_report_generator.generate(parsed_data, ats_result["overallScore"])

        # 4. Generate AI Suggestions
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
            is_active=True
        )

        saved = await self.repo.create_resume(new_resume)
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
            # Generate demo default active resume if user has not uploaded yet
            default_parsed = parser_service.parse(b"Default Resume", "pdf", "Nishanth_Varma_Resume.pdf")
            ats_res = ats_engine.calculate_score(default_parsed)
            health = health_report_generator.generate(default_parsed, ats_res["overallScore"])
            suggs = suggestion_generator.generate(default_parsed)

            demo_resume = ResumeModel(
                id=uuid.uuid4(),
                user_id=u_id,
                filename="Nishanth_Varma_Resume.pdf",
                original_name="Nishanth_Varma_Resume.pdf",
                file_path="/demo/Nishanth_Varma_Resume.pdf",
                file_size=1024 * 450,
                file_type="pdf",
                parsed_data=default_parsed,
                ats_score=ats_res["overallScore"],
                ats_breakdown=ats_res["breakdown"],
                health_report=health,
                suggestions=suggs,
                is_active=True
            )
            saved_demo = await self.repo.create_resume(demo_resume)
            all_versions = [saved_demo]
            active = saved_demo

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
        return job_matcher_engine.match(parsed_data=parsed, job_title="Senior Frontend Engineer", job_description=job_description or "")

    async def recommend_jobs(self, user_id: str) -> List[dict]:
        active = await self.get_active_resume(user_id)
        parsed = active["parsedData"]
        return ai_recommendation_engine.recommend(parsed_data=parsed)

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
        
        if not ats_trend:
            ats_trend = [
                {"date": "May 10", "score": 68, "version": "v1.0"},
                {"date": "Jun 14", "score": 75, "version": "v1.2"},
                {"date": "Jul 22", "score": 82, "version": "v2.0"},
                {"date": "Aug 05", "score": active["atsScore"], "version": "Active"}
            ]

        return {
            "skillDistribution": skill_dist,
            "atsTrend": ats_trend,
            "applicationsCount": 18,
            "resumeImprovementRate": 24.5,
            "jobMatchesCount": 42,
            "monthlyUploads": [
                {"month": "May", "uploads": 1},
                {"month": "Jun", "uploads": 2},
                {"month": "Jul", "uploads": 3},
                {"month": "Aug", "uploads": max(1, len(resumes))}
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
