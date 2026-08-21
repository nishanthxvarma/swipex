from app.repositories.user_repository import UserRepository
import uuid

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    async def get_profile(self, user_id: uuid.UUID):
        return await self.user_repo.get_profile(user_id)
    
    async def update_profile(self, user_id: uuid.UUID, profile_data):
        profile = await self.user_repo.get_profile(user_id)
        if not profile:
            from app.models.user import ProfileModel
            profile = ProfileModel(user_id=user_id)
            self.user_repo.db.add(profile)

        data = profile_data.model_dump(exclude_unset=True) if hasattr(profile_data, "model_dump") else profile_data
        for field, value in data.items():
            if hasattr(profile, field) and value is not None:
                setattr(profile, field, value)

        return await self.user_repo.update_profile(profile)
    
    async def get_dashboard_stats(self, user_id: uuid.UUID):
        return {"stats": {}}

    async def get_candidates(self):
        return await self.user_repo.get_candidates()
