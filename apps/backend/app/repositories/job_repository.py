from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.orm import joinedload
from app.models.job import JobModel, CompanyModel
import uuid

class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, job_id):
        from app.core.security import parse_id
        job_id = parse_id(job_id)
        result = await self.db.execute(select(JobModel).options(joinedload(JobModel.company)).where(JobModel.id == job_id))
        return result.scalars().first()

    async def list_jobs(self, page=1, per_page=10, filters=None):
        query = select(JobModel).options(joinedload(JobModel.company))
        if filters:
            # apply filters
            pass
        query = query.limit(per_page).offset((page - 1) * per_page)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create(self, job: JobModel):
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)
        return job
    
    async def update(self, job: JobModel):
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)
        return job

    async def delete(self, job_id):
        from app.core.security import parse_id
        job_id = parse_id(job_id)
        await self.db.execute(delete(JobModel).where(JobModel.id == job_id))
        await self.db.commit()

    async def get_feed(self, user_id, page=1, per_page=10):
        from app.core.security import parse_id
        user_id = parse_id(user_id)
        # In a real app this would exclude swiped jobs
        result = await self.db.execute(select(JobModel).options(joinedload(JobModel.company)).limit(per_page).offset((page - 1) * per_page))
        return result.scalars().all()

    async def search(self, query_str: str, filters=None, page=1, per_page=10):
        query = select(JobModel).options(joinedload(JobModel.company)).where(JobModel.title.ilike(f"%{query_str}%"))
        query = query.limit(per_page).offset((page - 1) * per_page)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_company_by_id(self, company_id):
        from app.core.security import parse_id
        company_id = parse_id(company_id)
        result = await self.db.execute(select(CompanyModel).where(CompanyModel.id == company_id))
        return result.scalars().first()
    
    async def list_companies(self, page=1, per_page=10):
        result = await self.db.execute(select(CompanyModel).limit(per_page).offset((page - 1) * per_page))
        return result.scalars().all()
