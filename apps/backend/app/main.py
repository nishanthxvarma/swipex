from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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
from sqlalchemy import select, text

from sqlalchemy.ext.asyncio import AsyncSession


async def migrate_database():
    """Add columns that were added to ORM models after the initial table creation.
    
    SQLAlchemy's create_all() only creates tables that don't exist yet —
    it never adds new columns to existing tables. This function fills that gap
    by issuing ALTER TABLE ... ADD COLUMN IF NOT EXISTS for every column that
    may be missing in production.
    """
    migrations = [
        # users table — columns added for Google OAuth and account management
        "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR DEFAULT 'local' NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
        # profiles table — columns added for enriched profile data
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline VARCHAR",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years VARCHAR",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education JSON",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications JSON",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS projects JSON",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experiences JSON",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSON",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url VARCHAR",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion VARCHAR",
        # password_reset_tokens table
        "CREATE TABLE IF NOT EXISTS password_reset_tokens (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id) ON DELETE CASCADE, token_hash VARCHAR NOT NULL, expires_at TIMESTAMP NOT NULL, is_used BOOLEAN DEFAULT FALSE NOT NULL, created_at TIMESTAMP DEFAULT NOW())",
        # refresh_tokens table
        "CREATE TABLE IF NOT EXISTS refresh_tokens (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id) ON DELETE CASCADE, token_hash VARCHAR NOT NULL, expires_at TIMESTAMP NOT NULL, is_revoked BOOLEAN DEFAULT FALSE NOT NULL, created_at TIMESTAMP DEFAULT NOW())",
        # resumes table — columns added for versioning and analysis metadata
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS parser_version VARCHAR DEFAULT '2.0.0'",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS scoring_version VARCHAR DEFAULT '2.0.0'",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS model_version VARCHAR DEFAULT 'deterministic-v2'",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS extraction_confidence FLOAT DEFAULT 1.0",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS raw_text VARCHAR",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS evidence_spans JSON",
        "ALTER TABLE resumes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
        # resume_analysis_history table
        "CREATE TABLE IF NOT EXISTS resume_analysis_history (id UUID PRIMARY KEY, resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE, parser_version VARCHAR NOT NULL DEFAULT '2.0.0', scoring_version VARCHAR NOT NULL DEFAULT '2.0.0', ats_score FLOAT DEFAULT 0.0, ats_breakdown JSON, health_report JSON, suggestions JSON, created_at TIMESTAMP DEFAULT NOW())",
        # companies table — ensure table exists and has necessary columns
        "CREATE TABLE IF NOT EXISTS companies (id UUID PRIMARY KEY, name VARCHAR NOT NULL, logo_url VARCHAR, description VARCHAR, industry VARCHAR, size VARCHAR, website VARCHAR, tech_stack JSON, culture VARCHAR, benefits JSON, rating FLOAT, employee_count INTEGER, founded_year INTEGER, headquarters VARCHAR, created_at TIMESTAMP DEFAULT NOW())",
        # jobs table — columns added for recruiter job management and rich job data
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS recruiter_id UUID REFERENCES users(id)",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_currency VARCHAR DEFAULT 'USD'",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT FALSE",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_required JSON DEFAULT '[]'",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_preferred JSON DEFAULT '[]'",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits JSON DEFAULT '[]'",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP DEFAULT NOW()",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
        # applications table
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter VARCHAR",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_url VARCHAR",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS ats_score FLOAT",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
        # recruiter_candidate_actions table
        "CREATE TABLE IF NOT EXISTS recruiter_candidate_actions (id UUID PRIMARY KEY, recruiter_id UUID NOT NULL REFERENCES users(id), candidate_id UUID NOT NULL REFERENCES users(id), job_id UUID REFERENCES jobs(id), action VARCHAR NOT NULL, notes VARCHAR, created_at TIMESTAMP DEFAULT NOW())",
    ]
    async with engine.begin() as conn:
        for stmt in migrations:
            try:
                await conn.execute(text(stmt))
            except Exception as e:
                # Log but don't crash — some may already exist or be unsupported on SQLite
                await logger.awarning("Migration statement skipped", stmt=stmt[:80], error=str(e)[:120])
    await logger.ainfo("Database migration check completed")


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
    # Startup logic: Connect to db, migrate schema, create tables, and seed admin
    await logger.ainfo("Starting up application and verifying database tables")
    await migrate_database()
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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    await logger.aerror("Unhandled server exception", path=request.url.path, error=str(exc))
    origin = request.headers.get("origin") or "*"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin if not is_wildcard else "*",
            "Access-Control-Allow-Credentials": "true" if not is_wildcard else "false",
        }
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
