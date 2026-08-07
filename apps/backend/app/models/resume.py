from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.core.database import Base

class ResumeModel(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    file_type = Column(String, default="pdf")
    parsed_data = Column(JSON, default=dict)
    ats_score = Column(Float, default=0.0)
    ats_breakdown = Column(JSON, default=dict)
    health_report = Column(JSON, default=dict)
    suggestions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    skills = relationship("ResumeSkillModel", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("ResumeProjectModel", back_populates="resume", cascade="all, delete-orphan")
    education = relationship("ResumeEducationModel", back_populates="resume", cascade="all, delete-orphan")
    experience = relationship("ResumeExperienceModel", back_populates="resume", cascade="all, delete-orphan")


class ResumeSkillModel(Base):
    __tablename__ = "resume_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    category = Column(String, nullable=False, default="tools")
    skill_name = Column(String, nullable=False)

    resume = relationship("ResumeModel", back_populates="skills")


class ResumeProjectModel(Base):
    __tablename__ = "resume_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String, nullable=False)
    technologies = Column(JSON, default=list)
    description = Column(String, nullable=True)

    resume = relationship("ResumeModel", back_populates="projects")


class ResumeEducationModel(Base):
    __tablename__ = "resume_education"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    degree = Column(String, nullable=False)
    college = Column(String, nullable=False)
    cgpa = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)

    resume = relationship("ResumeModel", back_populates="education")


class ResumeExperienceModel(Base):
    __tablename__ = "resume_experience"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), index=True, nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    duration = Column(String, nullable=True)
    description = Column(String, nullable=True)

    resume = relationship("ResumeModel", back_populates="experience")
