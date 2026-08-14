from pydantic import BaseModel
from typing import List, Optional
import uuid

class CompetitionIndicatorSchema(BaseModel):
    jobId: uuid.UUID
    applicantsCount: int
    competitionLevel: str
    percentileRank: Optional[float] = None
    rankHeadline: str
    userMatchScore: float
    skillMatchPct: float
    experienceMatchPct: float
    locationMatchPct: float
    atsScore: float
    missingSkills: List[str]
