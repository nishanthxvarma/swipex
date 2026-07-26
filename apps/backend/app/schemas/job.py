from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

class CompanyCreate(BaseModel):
    name: str

class CompanyResponse(BaseModel):
    id: uuid.UUID
    name: str

class JobCreate(BaseModel):
    title: str
    description: str
    company_id: uuid.UUID

class JobUpdate(BaseModel):
    title: Optional[str] = None

class JobResponse(BaseModel):
    id: uuid.UUID
    title: str
    company_id: uuid.UUID

class JobListResponse(BaseModel):
    id: uuid.UUID
    title: str
    company_id: uuid.UUID

class JobFeedResponse(BaseModel):
    id: uuid.UUID
    title: str
    company_id: uuid.UUID

class SwipeRequest(BaseModel):
    job_id: uuid.UUID
    direction: str

class ApplicationCreate(BaseModel):
    job_id: uuid.UUID
    cover_letter: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: uuid.UUID
    status: str

class SavedJobResponse(BaseModel):
    id: uuid.UUID
    job_id: uuid.UUID
    saved_at: datetime
