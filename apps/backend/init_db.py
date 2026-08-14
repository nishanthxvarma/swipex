import asyncio
import structlog
from app.core.database import engine, Base
# Import all models so metadata knows about them
from app.models.user import UserModel
from app.models.job import JobModel, CompanyModel
from app.models.application import ApplicationModel, SavedJobModel, SwipeModel
from app.models.notification import NotificationModel, NotificationPreferenceModel

logger = structlog.get_logger()

async def init_db():
    await logger.ainfo("Starting database initialization...")
    async with engine.begin() as conn:
        # create_all will only create tables that do not exist yet.
        # It will NOT alter existing tables, which is safe.
        await conn.run_sync(Base.metadata.create_all)
    await logger.ainfo("Database initialization completed safely.")

if __name__ == "__main__":
    asyncio.run(init_db())
