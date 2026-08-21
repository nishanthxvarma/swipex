from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.notification import AuditLogModel
import uuid
from typing import Optional, Dict, Any

class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_event(
        self,
        action: str,
        resource_type: str,
        user_id: Optional[uuid.UUID] = None,
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLogModel:
        log = AuditLogModel(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
            ip_address=ip_address
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_activity_logs(
        self,
        event_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ):
        query = select(AuditLogModel).order_by(desc(AuditLogModel.created_at))
        if event_type and event_type != "ALL":
            query = query.where(AuditLogModel.resource_type == event_type)
        
        query = query.limit(limit).offset(offset)
        res = await self.db.execute(query)
        return res.scalars().all()
