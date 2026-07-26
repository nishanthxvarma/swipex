// Job related types
export enum JobType {
  full_time = 'full_time',
  part_time = 'part_time',
  contract = 'contract',
  internship = 'internship',
}

export enum ExperienceLevel {
  entry = 'entry',
  mid = 'mid',
  senior = 'senior',
  lead = 'lead',
  executive = 'executive',
}

export enum SwipeDirection {
  left = 'left',
  right = 'right',
  up = 'up',
}

export enum ApplicationStatus {
  applied = 'applied',
  reviewing = 'reviewing',
  interview = 'interview',
  offer = 'offer',
  rejected = 'rejected',
  withdrawn = 'withdrawn',
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  techStack: string[];
  culture?: string;
  benefits: string[];
  rating: number;
  employeeCount: number;
  foundedYear: number;
  headquarters: string;
}

export interface Job {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  skillsPreferred: string[];
  benefits: string[];
  applicationDeadline?: string;
  isActive: boolean;
  viewsCount: number;
  applicationsCount: number;
  postedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  atsScore?: number;
  appliedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  savedAt: string;
}

export interface Swipe {
  id: string;
  userId: string;
  jobId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface JobFilters {
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: ExperienceLevel[];
  jobType?: JobType[];
  isRemote?: boolean;
  skills?: string[];
  companySize?: string[];
  industry?: string[];
  postedAfter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
