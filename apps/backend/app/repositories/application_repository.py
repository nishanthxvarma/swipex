from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.application import ApplicationModel, SwipeModel, SavedJobModel
from sqlalchemy.orm import joinedload
from app.models.job import JobModel
import uuid

class ApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_application(self, application: ApplicationModel):
        self.db.add(application)
        await self.db.commit()
        await self.db.refresh(application)
        return application

    async def get_user_applications(self, user_id: uuid.UUID, page=1, per_page=10):
        query = select(ApplicationModel).options(
            joinedload(ApplicationModel.job).joinedload(JobModel.company)
        ).where(ApplicationModel.user_id == user_id).limit(per_page).offset((page - 1) * per_page)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_recruiter_pipeline_applications(self, recruiter_id: uuid.UUID = None):
        from app.models.user import UserModel
        query = select(ApplicationModel).options(
            joinedload(ApplicationModel.job).joinedload(JobModel.company),
            joinedload(ApplicationModel.user).joinedload(UserModel.profile)
        ).order_by(ApplicationModel.applied_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_status(self, application_id, status: str):
        from app.core.security import parse_id
        application_id = parse_id(application_id)
        result = await self.db.execute(select(ApplicationModel).where(ApplicationModel.id == application_id))
        app = result.scalars().first()
        if app:
            app.status = status
            self.db.add(app)
            await self.db.commit()
            await self.db.refresh(app)
        return app

    async def save_job(self, saved_job: SavedJobModel):
        self.db.add(saved_job)
        await self.db.commit()
        await self.db.refresh(saved_job)
        return saved_job
    
    async def unsave_job(self, user_id, job_id):
        from app.core.security import parse_id
        user_id = parse_id(user_id)
        job_id = parse_id(job_id)
        await self.db.execute(delete(SavedJobModel).where(SavedJobModel.user_id == user_id).where(SavedJobModel.job_id == job_id))
        await self.db.commit()
    
    async def get_saved_jobs(self, user_id, page=1, per_page=10):
        query = select(SavedJobModel).where(SavedJobModel.user_id == user_id).limit(per_page).offset((page - 1) * per_page)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_swipe(self, swipe: SwipeModel):
        self.db.add(swipe)
        await self.db.commit()
        await self.db.refresh(swipe)
        return swipe
    
    async def get_user_swipes(self, user_id: uuid.UUID, page=1, per_page=10):
        query = select(SwipeModel).where(SwipeModel.user_id == user_id).limit(per_page).offset((page - 1) * per_page)
        result = await self.db.execute(query)
        return result.scalars().all()
