from app.repositories.job_repository import JobRepository
from app.models.job import JobModel
import uuid

class JobService:
    def __init__(self, job_repo: JobRepository):
        self.job_repo = job_repo

    async def get_job_feed(self, user_id: uuid.UUID, page: int):
        return await self.job_repo.get_feed(user_id, page)

    async def search_jobs(self, query: str, filters: dict):
        return await self.job_repo.search(query, filters)

    async def get_job_detail(self, job_id: uuid.UUID):
        return await self.job_repo.get_by_id(job_id)

    async def create_job(self, data, user_id: uuid.UUID):
        # verify recruiter role in caller
        job = JobModel(title=data.title, description=data.description, company_id=data.company_id)
        return await self.job_repo.create(job)
    
    async def process_swipe(self, user_id: uuid.UUID, job_id: uuid.UUID, direction: str):
        pass
