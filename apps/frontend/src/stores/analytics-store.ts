import { create } from 'zustand';
import {
  CandidateAnalyticsSummary,
  RecruiterAnalyticsSummary,
} from '@swipex/types';

interface AnalyticsState {
  candidateAnalytics: CandidateAnalyticsSummary | null;
  recruiterAnalytics: RecruiterAnalyticsSummary | null;
  timeRange: '7d' | '30d' | '90d' | 'all';
  isLoading: boolean;
  setTimeRange: (range: '7d' | '30d' | '90d' | 'all') => void;
  fetchCandidateAnalytics: (range?: '7d' | '30d' | '90d' | 'all') => Promise<void>;
  fetchRecruiterAnalytics: (range?: '7d' | '30d' | '90d' | 'all') => Promise<void>;
}

const DEFAULT_CANDIDATE_ANALYTICS: CandidateAnalyticsSummary = {
  careerScore: 88.5,
  profileCompletionPct: 92.0,
  totalJobsViewed: 124,
  jobsLiked: 42,
  jobsRejected: 82,
  jobsSaved: 18,
  applicationsSubmitted: 28,
  interviewsCount: 8,
  offersCount: 2,
  applicationSuccessRatePct: 28.6,
  timeRange: '30d',
  activityTimeline: [
    { date: 'W1', viewed: 14, applied: 3 },
    { date: 'W2', viewed: 22, applied: 6 },
    { date: 'W3', viewed: 18, applied: 5 },
    { date: 'W4', viewed: 32, applied: 8 },
    { date: 'W5', viewed: 38, applied: 6 },
  ],
  funnel: [
    { stage: 'Jobs Viewed', count: 124, conversionPct: 100.0 },
    { stage: 'Jobs Liked', count: 42, conversionPct: 33.9 },
    { stage: 'Jobs Applied', count: 28, conversionPct: 66.7 },
    { stage: 'Applications Viewed', count: 18, conversionPct: 64.3 },
    { stage: 'Shortlisted', count: 12, conversionPct: 66.7 },
    { stage: 'Interviews', count: 8, conversionPct: 66.7 },
    { stage: 'Offers', count: 2, conversionPct: 25.0 },
  ],
  topSkillsRequired: [
    { skill: 'React 19', count: 24 },
    { skill: 'TypeScript', count: 22 },
    { skill: 'Next.js App Router', count: 18 },
    { skill: 'Node.js', count: 14 },
    { skill: 'TailwindCSS', count: 12 },
  ],
  locationPreferences: [
    { locationType: 'Remote', percentage: 70.0 },
    { locationType: 'Hybrid', percentage: 20.0 },
    { locationType: 'Onsite', percentage: 10.0 },
  ],
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  candidateAnalytics: DEFAULT_CANDIDATE_ANALYTICS,
  recruiterAnalytics: null,
  timeRange: '30d',
  isLoading: false,

  setTimeRange: (timeRange) => {
    set({ timeRange });
    get().fetchCandidateAnalytics(timeRange);
  },

  fetchCandidateAnalytics: async (range) => {
    const targetRange = range || get().timeRange;
    set({ isLoading: true });
    try {
      // In production connect to API or fall back gracefully
      set({
        candidateAnalytics: {
          ...DEFAULT_CANDIDATE_ANALYTICS,
          timeRange: targetRange,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecruiterAnalytics: async (range) => {
    const targetRange = range || get().timeRange;
    set({ isLoading: true });
    try {
      set({
        recruiterAnalytics: {
          activeJobsCount: 14,
          applicationsReceivedCount: 142,
          applicationsReviewedCount: 98,
          shortlistedCount: 28,
          interviewsCount: 12,
          hiringConversionPct: 14.2,
          avgApplicantMatchScore: 88.4,
          pipelineDistribution: [
            { stage: 'Applied', count: 44 },
            { stage: 'Reviewing', count: 56 },
            { stage: 'Interview', count: 28 },
            { stage: 'Offer', count: 8 },
            { stage: 'Rejected', count: 6 },
          ],
          timeRange: targetRange,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
