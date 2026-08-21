from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    metadata: Optional[Dict[str, Any]] = None

class NotificationCreate(NotificationBase):
    user_id: uuid.UUID
    expires_at: Optional[datetime] = None

class NotificationResponse(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_read: bool
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_meta(cls, data: any):
        if hasattr(data, "metadata_json"):
            return {
                "id": getattr(data, "id", None),
                "user_id": getattr(data, "user_id", None),
                "type": getattr(data, "type", ""),
                "title": getattr(data, "title", ""),
                "message": getattr(data, "message", ""),
                "is_read": getattr(data, "is_read", False),
                "created_at": getattr(data, "created_at", None),
                "expires_at": getattr(data, "expires_at", None),
                "metadata": getattr(data, "metadata_json", {})
            }
        return data

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unreadCount: int
    total: int
    page: int
    perPage: int

from pydantic import Field

class NotificationPreferencesSchema(BaseModel):
    jobRecommendations: bool = Field(default=True, validation_alias="job_recommendations")
    applications: bool = True
    interviews: bool = True
    recruiterActivity: bool = Field(default=True, validation_alias="recruiter_activity")
    analytics: bool = True
    systemNotifications: bool = Field(default=True, validation_alias="system_notifications")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
