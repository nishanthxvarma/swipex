from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class FunnelStepSchema(BaseModel):
    stage: str
    count: int
    conversionPct: float

class TimelinePointSchema(BaseModel):
    date: str
    viewed: int
    applied: int

class TopSkillSchema(BaseModel):
    skill: str
    count: int

class LocationPrefSchema(BaseModel):
    locationType: str
    percentage: float

class CandidateAnalyticsSchema(BaseModel):
    careerScore: float
    profileCompletionPct: float
    totalJobsViewed: int
    jobsLiked: int
    jobsRejected: int
    jobsSaved: int
    applicationsSubmitted: int
    interviewsCount: int
    offersCount: int
    applicationSuccessRatePct: float
    timeRange: str
    activityTimeline: List[TimelinePointSchema]
    funnel: List[FunnelStepSchema]
    topSkillsRequired: List[TopSkillSchema]
    locationPreferences: List[LocationPrefSchema]

class PipelineStageCount(BaseModel):
    stage: str
    count: int

class RecruiterAnalyticsSchema(BaseModel):
    activeJobsCount: int
    applicationsReceivedCount: int
    applicationsReviewedCount: int
    shortlistedCount: int
    interviewsCount: int
    hiringConversionPct: float
    avgApplicantMatchScore: float
    pipelineDistribution: List[PipelineStageCount]
    timeRange: str
