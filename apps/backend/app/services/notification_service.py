from app.repositories.notification_repository import NotificationRepository
from app.models.notification import NotificationModel
import uuid
from typing import Optional, Dict, Any, List

# Type mapping to preference fields
TYPE_PREFERENCE_MAP = {
    'job_recommendation': 'job_recommendations',
    'job_matched': 'job_recommendations',
    'application_submitted': 'applications',
    'application_status_changed': 'applications',
    'application_viewed': 'recruiter_activity',
    'shortlisted': 'applications',
    'interview_scheduled': 'interviews',
    'interview_reminder': 'interviews',
    'job_saved': 'system_notifications',
    'recruiter_interaction': 'recruiter_activity',
    'ats_analysis_completed': 'analytics',
    'profile_reminder': 'system_notifications',
    'competition_change': 'analytics',
    'system_notification': 'system_notifications',
}

class NotificationService:
    def __init__(self, notif_repo: NotificationRepository):
        self.notif_repo = notif_repo

    async def create_notification(
        self,
        user_id: uuid.UUID,
        type_str: str,
        title: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[NotificationModel]:
        # Check user notification preferences
        prefs = await self.notif_repo.get_preferences(user_id)
        pref_attr = TYPE_PREFERENCE_MAP.get(type_str, 'system_notifications')
        if not getattr(prefs, pref_attr, True):
            return None

        notif = NotificationModel(
            user_id=user_id,
            type=type_str,
            title=title,
            message=message,
            metadata_json=metadata or {}
        )
        return await self.notif_repo.create_notification(notif)

    async def get_user_notifications(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
        is_read: Optional[bool] = None,
        notif_type: Optional[str] = None
    ):
        items, total, unread_count = await self.notif_repo.get_user_notifications(
            user_id, page, per_page, is_read, notif_type
        )
        return {
            "notifications": items,
            "unreadCount": unread_count,
            "total": total,
            "page": page,
            "perPage": per_page
        }

    async def get_unread_count(self, user_id: uuid.UUID) -> int:
        return await self.notif_repo.get_unread_count(user_id)

    async def mark_as_read(self, notif_id: uuid.UUID, user_id: uuid.UUID):
        return await self.notif_repo.mark_as_read(notif_id, user_id)

    async def mark_all_as_read(self, user_id: uuid.UUID):
        count = await self.notif_repo.mark_all_as_read(user_id)
        return {"success": True, "updatedCount": count}

    async def dismiss_notification(self, notif_id: uuid.UUID, user_id: uuid.UUID):
        success = await self.notif_repo.delete_notification(notif_id, user_id)
        return {"success": success}

    async def get_preferences(self, user_id: uuid.UUID):
        return await self.notif_repo.get_preferences(user_id)

    async def update_preferences(self, user_id: uuid.UUID, updates: dict):
        return await self.notif_repo.update_preferences(user_id, updates)
