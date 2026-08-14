from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_
from app.models.notification import NotificationModel, NotificationPreferenceModel
import uuid
from typing import Optional, List, Tuple
from datetime import datetime, timezone

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(self, notif: NotificationModel) -> NotificationModel:
        self.db.add(notif)
        await self.db.commit()
        await self.db.refresh(notif)
        return notif

    async def get_user_notifications(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
        is_read: Optional[bool] = None,
        notif_type: Optional[str] = None
    ) -> Tuple[List[NotificationModel], int, int]:
        conditions = [NotificationModel.user_id == user_id]
        if is_read is not None:
            conditions.append(NotificationModel.is_read == is_read)
        if notif_type:
            conditions.append(NotificationModel.type == notif_type)

        stmt = select(NotificationModel).where(and_(*conditions)).order_by(NotificationModel.created_at.desc())
        
        # Count total
        count_stmt = select(func.count(NotificationModel.id)).where(and_(*conditions))
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar_one()

        # Count unread
        unread_stmt = select(func.count(NotificationModel.id)).where(
            and_(NotificationModel.user_id == user_id, NotificationModel.is_read == False)
        )
        unread_result = await self.db.execute(unread_stmt)
        unread_count = unread_result.scalar_one()

        stmt = stmt.limit(per_page).offset((page - 1) * per_page)
        res = await self.db.execute(stmt)
        items = res.scalars().all()

        return items, total, unread_count

    async def get_unread_count(self, user_id: uuid.UUID) -> int:
        stmt = select(func.count(NotificationModel.id)).where(
            and_(NotificationModel.user_id == user_id, NotificationModel.is_read == False)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one()

    async def mark_as_read(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> Optional[NotificationModel]:
        stmt = select(NotificationModel).where(
            and_(NotificationModel.id == notif_id, NotificationModel.user_id == user_id)
        )
        res = await self.db.execute(stmt)
        notif = res.scalars().first()
        if notif:
            notif.is_read = True
            self.db.add(notif)
            await self.db.commit()
            await self.db.refresh(notif)
        return notif

    async def mark_all_as_read(self, user_id: uuid.UUID) -> int:
        stmt = update(NotificationModel).where(
            and_(NotificationModel.user_id == user_id, NotificationModel.is_read == False)
        ).values(is_read=True)
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount

    async def delete_notification(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        stmt = delete(NotificationModel).where(
            and_(NotificationModel.id == notif_id, NotificationModel.user_id == user_id)
        )
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount > 0

    async def get_preferences(self, user_id: uuid.UUID) -> NotificationPreferenceModel:
        stmt = select(NotificationPreferenceModel).where(NotificationPreferenceModel.user_id == user_id)
        res = await self.db.execute(stmt)
        prefs = res.scalars().first()
        if not prefs:
            prefs = NotificationPreferenceModel(user_id=user_id)
            self.db.add(prefs)
            await self.db.commit()
            await self.db.refresh(prefs)
        return prefs

    async def update_preferences(
        self, user_id: uuid.UUID, updates: dict
    ) -> NotificationPreferenceModel:
        prefs = await self.get_preferences(user_id)
        for key, value in updates.items():
            if hasattr(prefs, key) and value is not None:
                setattr(prefs, key, value)
        prefs.updated_at = datetime.now(timezone.utc)
        self.db.add(prefs)
        await self.db.commit()
        await self.db.refresh(prefs)
        return prefs
