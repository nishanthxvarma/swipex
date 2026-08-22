from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime, timezone
from app.core.database import Base

class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    reviewing = "reviewing"
    shortlisted = "shortlisted"
    interview = "interview"
    offer = "offer"
    hired = "hired"
    rejected = "rejected"
    withdrawn = "withdrawn"

class SwipeDirection(str, enum.Enum):
    left = "left"
    right = "right"
    up = "up"

from sqlalchemy.orm import relationship

def utc_now():
    """Returns a naive UTC datetime compatible with PostgreSQL TIMESTAMP WITHOUT TIME ZONE columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

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
    applied_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("UserModel", foreign_keys=[user_id])
    job = relationship("JobModel", foreign_keys=[job_id])

class SavedJobModel(Base):
    __tablename__ = "saved_jobs"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_saved"),)
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), index=True, nullable=False)
    saved_at = Column(DateTime, default=utc_now, index=True)

    user = relationship("UserModel", foreign_keys=[user_id])
    job = relationship("JobModel", foreign_keys=[job_id])

class SwipeModel(Base):
    __tablename__ = "swipes"
    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job_swipe"),)
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), index=True, nullable=False)
    direction = Column(Enum(SwipeDirection), nullable=False)
    created_at = Column(DateTime, default=utc_now, index=True)

    user = relationship("UserModel", foreign_keys=[user_id])
    job = relationship("JobModel", foreign_keys=[job_id])

class CandidateActionType(str, enum.Enum):
    pass_candidate = "pass"
    shortlist = "shortlist"
    interest = "interest"

class RecruiterCandidateActionModel(Base):
    __tablename__ = "recruiter_candidate_actions"
    __table_args__ = (UniqueConstraint("recruiter_id", "candidate_id", name="uq_recruiter_candidate_action"),)
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    action = Column(Enum(CandidateActionType), nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)

    recruiter = relationship("UserModel", foreign_keys=[recruiter_id])
    candidate = relationship("UserModel", foreign_keys=[candidate_id])
    job = relationship("JobModel", foreign_keys=[job_id])
