from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.user import UserModel, ProfileModel
import uuid

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id):
        from app.core.security import parse_id
        user_id = parse_id(user_id)
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

    async def delete(self, user_id):
        from app.core.security import parse_id
        user_id = parse_id(user_id)
        await self.db.execute(delete(UserModel).where(UserModel.id == user_id))
        await self.db.commit()

    async def get_profile(self, user_id):
        from app.core.security import parse_id
        user_id = parse_id(user_id)
        result = await self.db.execute(select(ProfileModel).where(ProfileModel.user_id == user_id))
        profile = result.scalars().first()
        if not profile:
            user = await self.get_by_id(user_id)
            if user:
                name = user.email.split("@")[0] if user.email else "Candidate"
                profile = ProfileModel(user_id=user_id, full_name=name, profile_completion="10%")
                self.db.add(profile)
                await self.db.commit()
                await self.db.refresh(profile)
        return profile

    async def update_profile(self, profile: ProfileModel):
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def get_by_google_id(self, google_id: str):
        result = await self.db.execute(select(UserModel).where(UserModel.google_id == google_id))
        return result.scalars().first()

    async def get_candidates(self):
        from sqlalchemy.orm import selectinload
        result = await self.db.execute(
            select(UserModel).options(selectinload(UserModel.profile)).where(UserModel.role == "job_seeker")
        )
        return result.scalars().all()

    async def create_password_reset_token(self, token_record):
        self.db.add(token_record)
        await self.db.commit()
        await self.db.refresh(token_record)
        return token_record

    async def get_valid_password_reset_token(self, token_hash: str):
        from app.models.user import PasswordResetTokenModel
        from datetime import datetime, timezone
        result = await self.db.execute(
            select(PasswordResetTokenModel).where(
                PasswordResetTokenModel.token_hash == token_hash,
                PasswordResetTokenModel.is_used == False,
                PasswordResetTokenModel.expires_at > datetime.now(timezone.utc)
            )
        )
        return result.scalars().first()

    async def mark_password_reset_token_used(self, token_id: uuid.UUID):
        from app.models.user import PasswordResetTokenModel
        result = await self.db.execute(select(PasswordResetTokenModel).where(PasswordResetTokenModel.id == token_id))
        t = result.scalars().first()
        if t:
            t.is_used = True
            self.db.add(t)
            await self.db.commit()

    async def save_refresh_token(self, refresh_record):
        self.db.add(refresh_record)
        await self.db.commit()
        await self.db.refresh(refresh_record)
        return refresh_record

    async def get_valid_refresh_token(self, token_hash: str):
        from app.models.user import RefreshTokenModel
        from datetime import datetime, timezone
        result = await self.db.execute(
            select(RefreshTokenModel).where(
                RefreshTokenModel.token_hash == token_hash,
                RefreshTokenModel.is_revoked == False,
                RefreshTokenModel.expires_at > datetime.now(timezone.utc)
            )
        )
        return result.scalars().first()

    async def revoke_refresh_tokens_for_user(self, user_id):
        from app.core.security import parse_id
        user_id = parse_id(user_id)
        from app.models.user import RefreshTokenModel
        result = await self.db.execute(select(RefreshTokenModel).where(RefreshTokenModel.user_id == user_id, RefreshTokenModel.is_revoked == False))
        for token in result.scalars().all():
            token.is_revoked = True
            self.db.add(token)
        await self.db.commit()

    async def save_candidate_action(self, action_record):
        self.db.add(action_record)
        await self.db.commit()
        await self.db.refresh(action_record)
        return action_record

    async def get_candidate_action(self, recruiter_id, candidate_id):
        from app.core.security import parse_id
        recruiter_id = parse_id(recruiter_id)
        candidate_id = parse_id(candidate_id)
        from app.models.application import RecruiterCandidateActionModel
        result = await self.db.execute(
            select(RecruiterCandidateActionModel).where(
                RecruiterCandidateActionModel.recruiter_id == recruiter_id,
                RecruiterCandidateActionModel.candidate_id == candidate_id
            )
        )
        return result.scalars().first()
