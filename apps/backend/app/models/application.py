from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime, timezone
from app.core.database import Base

class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    reviewing = "reviewing"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"
    withdrawn = "withdrawn"

class SwipeDirection(str, enum.Enum):
    left = "left"
    right = "right"
    up = "up"

class ApplicationModel(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_application"),)
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), index=True, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied, index=True)
    cover_letter = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    ats_score = Column(Float, nullable=True)
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SavedJobModel(Base):
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_saved"),)
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), index=True, nullable=False)
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class SwipeModel(Base):
    __tablename__ = "swipes"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_swipe"),)
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), index=True, nullable=False)
    direction = Column(Enum(SwipeDirection), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
