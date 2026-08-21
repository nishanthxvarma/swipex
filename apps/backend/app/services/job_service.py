from app.repositories.job_repository import JobRepository
from app.models.job import JobModel
import uuid
from sqlalchemy import select, delete
from sqlalchemy.orm import joinedload

class JobService:
    def __init__(self, job_repo: JobRepository):
        self.job_repo = job_repo

    async def list_jobs(self, page=1, per_page=10):
        return await self.job_repo.list_jobs(page, per_page)

    async def get_feed(self, user_id: uuid.UUID, page=1, per_page=10):
        return await self.job_repo.get_feed(user_id, page, per_page)

    async def search_jobs(self, query: str, filters: dict = None, page=1, per_page=10):
        return await self.job_repo.search(query, filters, page, per_page)

    async def get_job_detail(self, job_id: uuid.UUID):
        return await self.job_repo.get_by_id(job_id)

    async def create_job(self, job: JobModel):
        return await self.job_repo.create(job)
    
    async def swipe_job(self, user_id: uuid.UUID, job_id: uuid.UUID, direction: str):
        from app.models.application import SwipeModel, SwipeDirection
        # Clean direction enum
        dir_val = SwipeDirection.right
        if direction == "left":
            dir_val = SwipeDirection.left
        elif direction == "up":
            dir_val = SwipeDirection.up
            
        swipe = SwipeModel(
            user_id=user_id,
            job_id=job_id,
            direction=dir_val
        )
        self.job_repo.db.add(swipe)
        await self.job_repo.db.commit()
        return {"success": True}
        
    async def save_job(self, user_id: uuid.UUID, job_id: uuid.UUID):
        from app.models.application import SavedJobModel
        saved = SavedJobModel(
            user_id=user_id,
            job_id=job_id
        )
        self.job_repo.db.add(saved)
        await self.job_repo.db.commit()
        await self.job_repo.db.refresh(saved)
        return saved
        
    async def unsave_job(self, user_id: uuid.UUID, job_id: uuid.UUID):
        from app.models.application import SavedJobModel
        await self.job_repo.db.execute(
            delete(SavedJobModel).where(SavedJobModel.user_id == user_id, SavedJobModel.job_id == job_id)
        )
        await self.job_repo.db.commit()
        return {"success": True}
        
    async def get_saved_jobs(self, user_id: uuid.UUID):
        from app.models.application import SavedJobModel
        res = await self.job_repo.db.execute(
            select(SavedJobModel).options(joinedload(SavedJobModel.job).joinedload(JobModel.company)).where(SavedJobModel.user_id == user_id)
        )
        return res.scalars().all()
