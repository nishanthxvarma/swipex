from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID

class PersonalInformationSchema(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    location: Optional[str] = ""
    headline: Optional[str] = ""

class EducationEntrySchema(BaseModel):
    id: Optional[str] = None
    degree: str = ""
    college: str = ""
    cgpa: str = ""
    graduationYear: str = ""

class CategorizedSkillsSchema(BaseModel):
    programmingLanguages: List[str] = []
    frameworks: List[str] = []
    libraries: List[str] = []
    databases: List[str] = []
    cloud: List[str] = []
    tools: List[str] = []

class ExperienceEntrySchema(BaseModel):
    id: Optional[str] = None
    company: str = ""
    role: str = ""
    duration: str = ""
    description: str = ""

class ProjectEntrySchema(BaseModel):
    id: Optional[str] = None
    title: str = ""
    technologies: List[str] = []
    description: str = ""

class ParsedResumeSchema(BaseModel):
    personalInfo: PersonalInformationSchema = Field(default_factory=PersonalInformationSchema)
    education: List[EducationEntrySchema] = []
    skills: CategorizedSkillsSchema = Field(default_factory=CategorizedSkillsSchema)
    experience: List[ExperienceEntrySchema] = []
    projects: List[ProjectEntrySchema] = []
    certifications: List[str] = []
    achievements: List[str] = []
    languages: List[str] = []

class CategoryScoreDetail(BaseModel):
    score: float
    max: float
    details: str

class ATSCategoryBreakdownSchema(BaseModel):
    contactInfo: CategoryScoreDetail
    education: CategoryScoreDetail
    projects: CategoryScoreDetail
    skills: CategoryScoreDetail
    experience: CategoryScoreDetail
    keywords: CategoryScoreDetail
    formatting: CategoryScoreDetail

class ATSScoreResponseSchema(BaseModel):
    overallScore: float
    breakdown: ATSCategoryBreakdownSchema
    grade: str
    statusText: str

class HealthReportItemSchema(BaseModel):
    category: str
    title: str
    description: str
    type: str

class HealthReportSchema(BaseModel):
    strengths: List[str] = []
    weaknesses: List[str] = []
    missingSections: List[str] = []
    duplicateInfo: List[str] = []
    grammarAlerts: List[str] = []
    keywordDensityRating: str = "Moderate"
    formattingQuality: str = "Good"
    overallReadabilityScore: float = 80.0
    items: List[HealthReportItemSchema] = []

class SuggestionSchema(BaseModel):
    id: str
    category: str
    problem: str
    reason: str
    current: str
    suggested: str
    impactScore: Optional[float] = 10.0

class JobMatchRequestSchema(BaseModel):
    jobId: Optional[str] = None
    jobDescription: Optional[str] = None
    resumeId: Optional[str] = None

class JobMatchResultSchema(BaseModel):
    jobId: Optional[str] = None
    jobTitle: str
    companyName: str
    matchPercentage: float
    satisfiedSkills: List[str] = []
    missingSkills: List[str] = []
    educationMatch: bool = True
    experienceMatch: bool = True
    matchingKeywords: List[str] = []
    recommendationReason: str = ""

class SkillGapAnalysisSchema(BaseModel):
    matchPercentage: float
    alreadyKnown: List[str] = []
    needToLearn: List[str] = []
    prioritySkills: List[str] = []
    optionalSkills: List[str] = []
    gapProgress: float = 0.0

class JobRecommendationSchema(BaseModel):
    id: str
    jobTitle: str
    companyName: str
    location: str
    salary: str
    matchPercentage: float
    tier: str
    reason: str
    matchingSkills: List[str] = []
    missingSkills: List[str] = []
    expectedAtsScore: float

class ResumeVersionSchema(BaseModel):
    id: str
    userId: str
    filename: str
    originalName: str
    fileSize: int
    fileType: str
    atsScore: float
    isActive: bool
    uploadedAt: str

class ResumeAnalyticsSchema(BaseModel):
    skillDistribution: List[Dict[str, Any]] = []
    atsTrend: List[Dict[str, Any]] = []
    applicationsCount: int = 0
    resumeImprovementRate: float = 0.0
    jobMatchesCount: int = 0
    monthlyUploads: List[Dict[str, Any]] = []

class ActiveResumeResponseSchema(BaseModel):
    id: str
    userId: str
    filename: str
    originalName: str
    fileUrl: str
    fileSize: int
    fileType: str
    parsedData: ParsedResumeSchema
    atsScore: float
    atsBreakdown: ATSCategoryBreakdownSchema
    healthReport: HealthReportSchema
    suggestions: List[SuggestionSchema] = []
    isActive: bool
    uploadedAt: str
    versions: List[ResumeVersionSchema] = []
