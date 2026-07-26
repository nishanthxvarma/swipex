from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.models.user import UserModel
from fastapi import HTTPException

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register(self, data):
        if await self.user_repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user = UserModel(email=data.email, hashed_password=hash_password(data.password), role=data.role)
        created_user = await self.user_repo.create(user)
        return {
            "access_token": create_access_token(created_user.id, created_user.role),
            "refresh_token": create_refresh_token(created_user.id),
            "user": {"id": str(created_user.id), "email": created_user.email, "role": created_user.role}
        }
    
    async def login(self, email, password):
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "access_token": create_access_token(user.id, user.role),
            "refresh_token": create_refresh_token(user.id),
            "user": {"id": str(user.id), "email": user.email, "role": user.role}
        }
    
    async def refresh_token(self, refresh_token):
        # Implementation for refresh
        pass
    
    async def google_oauth(self, token):
        # Implementation for Google OAuth
        pass
    
    async def forgot_password(self, email):
        pass
    
    async def reset_password(self, token, new_password):
        pass
