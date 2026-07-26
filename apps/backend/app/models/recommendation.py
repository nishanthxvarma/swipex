from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from app.core.database import Base

class RecommendationModel(Base):
    __tablename__ = "recommendations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    score = Column(Float)
    reason = Column(String)
    algorithm = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ResumeModel(Base):
    __tablename__ = "resumes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    file_url = Column(String)
    filename = Column(String)
    parsed_data = Column(JSON, default=dict)
    skills_extracted = Column(JSON, default=list)
    experience_extracted = Column(JSON, default=list)
    education_extracted = Column(JSON, default=list)
    ats_score = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
