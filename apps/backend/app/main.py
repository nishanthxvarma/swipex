from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
from app.api.v1.router import api_router
from app.core.config import settings
import structlog

logger = structlog.get_logger()

from app.core.database import engine, Base, async_session_factory
from app.models.user import UserModel, ProfileModel, RoleEnum
from app.core.security import hash_password
from sqlalchemy import select

from sqlalchemy.ext.asyncio import AsyncSession

async def seed_admin_account(session: AsyncSession = None):
    admin_email = (settings.ADMIN_EMAIL or "sxadmin@gmail.com").lower().strip()
    admin_password = settings.ADMIN_PASSWORD or "Sxpassword1234"
    admin_full_name = settings.ADMIN_FULL_NAME or "SwipeX System Administrator"

    if not admin_email or not admin_password:
        await logger.awarning("Admin credentials not configured; skipping admin seed")
        return

    async def _execute_seed(db: AsyncSession):
        stmt = select(UserModel).where(UserModel.email == admin_email)
        res = await db.execute(stmt)
        existing_admin = res.scalar_one_or_none()

        if not existing_admin:
            admin_user = UserModel(
                email=admin_email,
                hashed_password=hash_password(admin_password),
                role=RoleEnum.admin,
                auth_provider="local",
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            await db.flush()

            admin_profile = ProfileModel(
                user_id=admin_user.id,
                full_name=admin_full_name,
                headline="Platform Administrator",
                bio="Authoritative SwipeX System Administrator."
            )
            db.add(admin_profile)
            await db.commit()
            await logger.ainfo("Predefined admin account seeded successfully", email=admin_email)
        else:
            existing_admin.role = RoleEnum.admin
            existing_admin.is_active = True
            existing_admin.is_verified = True
            existing_admin.hashed_password = hash_password(admin_password)
            await db.commit()
            await logger.ainfo("Predefined admin account verified and synchronized", email=admin_email)

    if session:
        await _execute_seed(session)
    else:
        try:
            async with async_session_factory() as db:
                await _execute_seed(db)
        except Exception as e:
            await logger.aerror("Failed to seed predefined admin account", error=str(e))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Connect to db, create tables, and seed admin
    await logger.ainfo("Starting up application and verifying database tables")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_admin_account()
    yield
    # Shutdown logic
    await logger.ainfo("Shutting down application")

app = FastAPI(title="SwipeX API", lifespan=lifespan)

cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
is_wildcard = "*" in cors_origins or not cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def performance_timing_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    
    # Attach Server-Timing header for frontend network diagnostics
    response.headers["Server-Timing"] = f"total;dur={duration_ms}"
    
    # Log structured performance metric
    if not request.url.path.endswith("/health"):
        logger.info(
            "http_request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )
    return response

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
