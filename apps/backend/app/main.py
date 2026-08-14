from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.router import api_router
from app.core.config import settings
import structlog

logger = structlog.get_logger()

from app.core.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Connect to redis/db and create tables
    await logger.ainfo("Starting up application and verifying database tables")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown logic
    await logger.ainfo("Shutting down application")

app = FastAPI(title="SwipeX API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
