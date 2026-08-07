from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from uuid import UUID
from typing import List, Optional
from app.models.resume import (
    ResumeModel, ResumeSkillModel, ResumeProjectModel, ResumeEducationModel, ResumeExperienceModel
)

class ResumeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_resume(self, resume: ResumeModel) -> ResumeModel:
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def get_active_resume_by_user(self, user_id: UUID) -> Optional[ResumeModel]:
        stmt = select(ResumeModel).where(
            ResumeModel.user_id == user_id,
            ResumeModel.is_active == True
        ).order_by(ResumeModel.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_resumes_by_user(self, user_id: UUID) -> List[ResumeModel]:
        stmt = select(ResumeModel).where(
            ResumeModel.user_id == user_id
        ).order_by(ResumeModel.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_resume_by_id(self, resume_id: UUID) -> Optional[ResumeModel]:
        stmt = select(ResumeModel).where(ResumeModel.id == resume_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def set_active(self, user_id: UUID, resume_id: UUID) -> Optional[ResumeModel]:
        # Deactivate all user resumes
        await self.db.execute(
            update(ResumeModel).where(ResumeModel.user_id == user_id).values(is_active=False)
        )
        # Activate specific resume
        await self.db.execute(
            update(ResumeModel).where(ResumeModel.id == resume_id, ResumeModel.user_id == user_id).values(is_active=True)
        )
        await self.db.commit()
        return await self.get_resume_by_id(resume_id)

    async def delete_resume(self, user_id: UUID, resume_id: UUID) -> bool:
        stmt = select(ResumeModel).where(ResumeModel.id == resume_id, ResumeModel.user_id == user_id)
        result = await self.db.execute(stmt)
        resume = result.scalars().first()
        if not resume:
            return False

        was_active = resume.is_active
        await self.db.delete(resume)
        await self.db.commit()

        # If deleted active resume, set latest remaining resume as active
        if was_active:
            latest_stmt = select(ResumeModel).where(ResumeModel.user_id == user_id).order_by(ResumeModel.created_at.desc())
            latest_res = await self.db.execute(latest_stmt)
            latest = latest_res.scalars().first()
            if latest:
                latest.is_active = True
                await self.db.commit()
        return True

    async def update_resume_analysis(
        self, resume_id: UUID, ats_score: float, ats_breakdown: dict, health_report: dict, suggestions: list
    ) -> Optional[ResumeModel]:
        stmt = select(ResumeModel).where(ResumeModel.id == resume_id)
        result = await self.db.execute(stmt)
        resume = result.scalars().first()
        if resume:
            resume.ats_score = ats_score
            resume.ats_breakdown = ats_breakdown
            resume.health_report = health_report
            resume.suggestions = suggestions
            await self.db.commit()
            await self.db.refresh(resume)
        return resume
