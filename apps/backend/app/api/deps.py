from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.job_repository import JobRepository
from app.repositories.application_repository import ApplicationRepository
from app.services.auth_service import AuthService
from app.services.job_service import JobService
from app.services.user_service import UserService

def get_user_repository(db: AsyncSession = Depends(get_db)):
    return UserRepository(db)

def get_job_repository(db: AsyncSession = Depends(get_db)):
    return JobRepository(db)

def get_application_repository(db: AsyncSession = Depends(get_db)):
    return ApplicationRepository(db)

def get_auth_service(repo: UserRepository = Depends(get_user_repository)):
    return AuthService(repo)

def get_job_service(repo: JobRepository = Depends(get_job_repository)):
    return JobService(repo)

def get_user_service(repo: UserRepository = Depends(get_user_repository)):
    return UserService(repo)
