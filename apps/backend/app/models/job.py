from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, JSON, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.core.database import Base

class JobTypeEnum(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"

class ExperienceLevelEnum(str, enum.Enum):
    entry = "entry"
    mid = "mid"
    senior = "senior"
    lead = "lead"
    executive = "executive"

class CompanyModel(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    logo_url = Column(String)
    description = Column(String)
    industry = Column(String)
    size = Column(String)
    website = Column(String)
    tech_stack = Column(JSON, default=list)
    culture = Column(String)
    benefits = Column(JSON, default=list)
    rating = Column(Float)
    employee_count = Column(Integer)
    founded_year = Column(Integer)
    headquarters = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    jobs = relationship("JobModel", back_populates="company")

class JobModel(Base):
    __tablename__ = "jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    requirements = Column(String)
    salary_min = Column(Float)
    salary_max = Column(Float)
    salary_currency = Column(String, default="USD")
    location = Column(String)
    is_remote = Column(Boolean, default=False)
    job_type = Column(Enum(JobTypeEnum))
    experience_level = Column(Enum(ExperienceLevelEnum))
    skills_required = Column(JSON, default=list)
    skills_preferred = Column(JSON, default=list)
    benefits = Column(JSON, default=list)
    application_deadline = Column(DateTime)
    is_active = Column(Boolean, default=True, index=True)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    posted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    company = relationship("CompanyModel", back_populates="jobs")
