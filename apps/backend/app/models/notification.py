from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime, timezone
from app.core.database import Base

class InterviewType(str, enum.Enum):
    phone = "phone"
    video = "video"
    onsite = "onsite"
    technical = "technical"

class NotificationModel(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    type = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, index=True, nullable=False)
    metadata_json = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    expires_at = Column(DateTime, nullable=True)

class NotificationPreferenceModel(Base):
    __tablename__ = "notification_preferences"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True, nullable=False)
    job_recommendations = Column(Boolean, default=True)
    applications = Column(Boolean, default=True)
    interviews = Column(Boolean, default=True)
    recruiter_activity = Column(Boolean, default=True)
    analytics = Column(Boolean, default=True)
    system_notifications = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(String)
    metadata_json = Column("metadata", JSON, default=dict)
    ip_address = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class InterviewScheduleModel(Base):
    __tablename__ = "interview_schedules"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"))
    scheduled_at = Column(DateTime)
    duration_minutes = Column(Integer)
    type = Column(Enum(InterviewType))
    location = Column(String)
    meeting_url = Column(String)
    notes = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
