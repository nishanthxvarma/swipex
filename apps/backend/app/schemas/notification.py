from pydantic import BaseModel, ConfigDict
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

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unreadCount: int
    total: int
    page: int
    perPage: int

class NotificationPreferencesSchema(BaseModel):
    jobRecommendations: bool = True
    applications: bool = True
    interviews: bool = True
    recruiterActivity: bool = True
    analytics: bool = True
    systemNotifications: bool = True

    model_config = ConfigDict(from_attributes=True)
