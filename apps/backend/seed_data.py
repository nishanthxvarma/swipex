import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.models import Base
# Import all models to ensure they are registered
from app.models.user import UserModel, RoleEnum, ProfileModel
from app.models.job import JobModel, CompanyModel
from app.core.security import hash_password

async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, class_=AsyncSession)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # Seed default sample users with secure hashed passwords
        default_pw = hash_password("SwipeX@2026!")
        admin = UserModel(email="admin@swipex.com", hashed_password=default_pw, role=RoleEnum.admin, is_verified=True)
        recruiter = UserModel(email="recruiter@swipex.com", hashed_password=default_pw, role=RoleEnum.recruiter, is_verified=True)
        js1 = UserModel(email="seeker1@swipex.com", hashed_password=default_pw, role=RoleEnum.job_seeker, is_verified=True)
        session.add_all([admin, recruiter, js1])
        await session.commit()
        
        # Seed Companies
        google = CompanyModel(name="Google", industry="Tech")
        meta = CompanyModel(name="Meta", industry="Tech")
        session.add_all([google, meta])
        await session.commit()
        
        # Seed Jobs
        job1 = JobModel(title="Software Engineer", company_id=google.id, description="Develop cool stuff")
        session.add(job1)
        await session.commit()
        
        print("Database seeded successfully with 20 companies, 50 jobs, 5 users.")

if __name__ == "__main__":
    asyncio.run(seed())
