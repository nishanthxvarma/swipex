// Common types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface SearchQuery {
  query?: string;
  filters?: Record<string, any>;
  page?: number;
  perPage?: number;
}

export type NotificationType =
  | 'job_matched'
  | 'application_submitted'
  | 'application_status_changed'
  | 'application_viewed'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'job_saved'
  | 'recruiter_interaction'
  | 'ats_analysis_completed'
  | 'profile_reminder'
  | 'job_recommendation'
  | 'competition_change'
  | 'system_notification';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  jobRecommendations: boolean;
  applications: boolean;
  interviews: boolean;
  recruiterActivity: boolean;
  analytics: boolean;
  systemNotifications: boolean;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  perPage: number;
}

export interface FunnelStep {
  stage: 'Jobs Viewed' | 'Jobs Liked' | 'Jobs Applied' | 'Applications Viewed' | 'Shortlisted' | 'Interviews' | 'Offers';
  count: number;
  conversionPct: number;
}

export interface CandidateAnalyticsSummary {
  careerScore: number;
  profileCompletionPct: number;
  totalJobsViewed: number;
  jobsLiked: number;
  jobsRejected: number;
  jobsSaved: number;
  applicationsSubmitted: number;
  interviewsCount: number;
  offersCount: number;
  applicationSuccessRatePct: number;
  timeRange: '7d' | '30d' | '90d' | 'all';
  activityTimeline: Array<{ date: string; viewed: number; applied: number }>;
  funnel: FunnelStep[];
  topSkillsRequired: Array<{ skill: string; count: number }>;
  locationPreferences: Array<{ locationType: 'Remote' | 'Hybrid' | 'Onsite'; percentage: number }>;
}

export interface RecruiterAnalyticsSummary {
  activeJobsCount: number;
  applicationsReceivedCount: number;
  applicationsReviewedCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  hiringConversionPct: number;
  avgApplicantMatchScore: number;
  pipelineDistribution: Array<{ stage: string; count: number }>;
  timeRange: '7d' | '30d' | '90d' | 'all';
}

export interface CompetitionIndicator {
  jobId: string;
  applicantsCount: number;
  competitionLevel: 'Early Applicant Pool' | 'Low' | 'Moderate' | 'High' | 'Very High';
  percentileRank?: number;
  rankHeadline: string;
  userMatchScore: number;
  skillMatchPct: number;
  experienceMatchPct: number;
  locationMatchPct: number;
  atsScore: number;
  missingSkills: string[];
}

export interface DashboardStats {
  totalApplications: number;
  savedJobs: number;
  interviews: number;
  profileStrength: number;
  resumeScore: number;
  weeklyProgress: number;
  matchPercentage: number;
}
