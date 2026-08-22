export interface PersonalInformation {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location?: string;
  headline?: string;
  bio?: string;
}

export interface EducationEntry {
  id?: string;
  degree: string;
  college: string;
  cgpa: string;
  graduationYear: string;
  fieldOfStudy?: string;
}

export interface CategorizedSkills {
  programmingLanguages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  cloud: string[];
  tools: string[];
}

export interface ExperienceEntry {
  id?: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  technologies?: string[];
}

export interface ProjectEntry {
  id?: string;
  title: string;
  technologies: string[];
  description: string;
  liveUrl?: string;
  repoUrl?: string;
}

export interface ParsedResume {
  personalInfo: PersonalInformation;
  education: EducationEntry[];
  skills: CategorizedSkills;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: string[];
  achievements: string[];
  languages: string[];
}

export interface ATSCategoryBreakdown {
  contactInfo: { score: number; max: 10; details: string };
  education: { score: number; max: 15; details: string };
  projects: { score: number; max: 20; details: string };
  skills: { score: number; max: 25; details: string };
  experience: { score: number; max: 15; details: string };
  keywords: { score: number; max: 10; details: string };
  formatting: { score: number; max: 5; details: string };
}

export interface ATSScoreResult {
  overallScore: number;
  breakdown: ATSCategoryBreakdown;
  grade: 'Red' | 'Yellow' | 'Green';
  statusText: string;
}

export interface HealthReportItem {
  category: string;
  title: string;
  description: string;
  type: 'strength' | 'weakness' | 'missing' | 'warning' | 'info';
}

export interface HealthReport {
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  duplicateInfo: string[];
  grammarAlerts: string[];
  keywordDensityRating: 'Low' | 'Moderate' | 'Optimal' | 'Overstuffed';
  formattingQuality: 'Basic' | 'Good' | 'Excellent';
  overallReadabilityScore: number; // 0-100
  items: HealthReportItem[];
}

export interface AiSuggestion {
  id: string;
  category: string;
  problem: string;
  reason: string;
  current: string;
  suggested: string;
  impactScore?: number;
}

export interface SkillGapCategory {
  categoryName: string;
  skills: string[];
}

export interface SkillGapAnalysis {
  matchPercentage: number;
  alreadyKnown: string[];
  needToLearn: string[];
  prioritySkills: string[];
  optionalSkills: string[];
  gapProgress: number; // 0-100%
}

export interface JobMatchResult {
  jobId?: string;
  jobTitle: string;
  companyName: string;
  matchPercentage: number;
  satisfiedSkills: string[];
  missingSkills: string[];
  educationMatch: boolean;
  experienceMatch: boolean;
  matchingKeywords: string[];
  recommendationReason: string;
}

export interface JobRecommendation {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: string;
  matchPercentage: number;
  tier: 'Top Match' | 'Good Match' | 'Stretch Match';
  reason: string;
  matchingSkills: string[];
  missingSkills: string[];
  expectedAtsScore: number;
}

export interface ResumeVersion {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  atsScore: number;
  isActive: boolean;
  versionNumber?: number;
  uploadedAt: string;
}

export interface ResumeAnalytics {
  skillDistribution: { category: string; count: number }[];
  atsTrend: { date: string; score: number; version: string }[];
  applicationsCount: number;
  resumeImprovementRate: number;
  jobMatchesCount: number;
  monthlyUploads: { month: string; uploads: number }[];
}

export interface ActiveResumeResponse {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  parsedData: ParsedResume;
  atsScore: number;
  atsBreakdown: ATSCategoryBreakdown;
  healthReport: HealthReport;
  suggestions: AiSuggestion[];
  isActive: boolean;
  versionNumber?: number;
  uploadedAt: string;
  versions: ResumeVersion[];
}
