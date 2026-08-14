from fastapi import APIRouter
from app.api.v1 import auth, users, jobs, applications, companies, search, notifications, resumes, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

