from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.user import UserModel, ProfileModel
import uuid

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID):
        result = await self.db.execute(select(UserModel).where(UserModel.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str):
        result = await self.db.execute(select(UserModel).where(UserModel.email == email))
        return result.scalars().first()

    async def create(self, user: UserModel):
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user: UserModel):
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: uuid.UUID):
        await self.db.execute(delete(UserModel).where(UserModel.id == user_id))
        await self.db.commit()

    async def get_profile(self, user_id: uuid.UUID):
        result = await self.db.execute(select(ProfileModel).where(ProfileModel.user_id == user_id))
        return result.scalars().first()

    async def update_profile(self, profile: ProfileModel):
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def get_candidates(self):
        from sqlalchemy.orm import selectinload
        result = await self.db.execute(
            select(UserModel).options(selectinload(UserModel.profile)).where(UserModel.role == "job_seeker")
        )
        return result.scalars().all()
