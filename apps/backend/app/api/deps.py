from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.job_repository import JobRepository
from app.repositories.application_repository import ApplicationRepository
from app.repositories.resume_repository import ResumeRepository

from app.services.auth_service import AuthService
from app.services.job_service import JobService
from app.services.user_service import UserService
from app.services.resume_service import ResumeService

from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService
from app.services.analytics_service import AnalyticsService
from app.services.competition_service import CompetitionService

def get_user_repository(db: AsyncSession = Depends(get_db)):
    return UserRepository(db)

def get_job_repository(db: AsyncSession = Depends(get_db)):
    return JobRepository(db)

def get_application_repository(db: AsyncSession = Depends(get_db)):
    return ApplicationRepository(db)

def get_resume_repository(db: AsyncSession = Depends(get_db)):
    return ResumeRepository(db)

def get_notification_repository(db: AsyncSession = Depends(get_db)):
    return NotificationRepository(db)

def get_auth_service(repo: UserRepository = Depends(get_user_repository)):
    return AuthService(repo)

def get_job_service(repo: JobRepository = Depends(get_job_repository)):
    return JobService(repo)

def get_user_service(repo: UserRepository = Depends(get_user_repository)):
    return UserService(repo)

def get_resume_service(repo: ResumeRepository = Depends(get_resume_repository)):
    return ResumeService(repo)

def get_notification_service(repo: NotificationRepository = Depends(get_notification_repository)):
    return NotificationService(repo)

def get_analytics_service(db: AsyncSession = Depends(get_db)):
    return AnalyticsService(db)

def get_competition_service(db: AsyncSession = Depends(get_db)):
    return CompetitionService(db)

from app.services.audit_service import AuditService
from app.repositories.company_repository import CompanyRepository

def get_audit_service(db: AsyncSession = Depends(get_db)):
    return AuditService(db)

def get_company_repository(db: AsyncSession = Depends(get_db)):
    return CompanyRepository(db)

