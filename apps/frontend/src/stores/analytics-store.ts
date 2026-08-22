import { create } from 'zustand';
import {
  CandidateAnalyticsSummary,
  RecruiterAnalyticsSummary,
} from '@swipex/types';
import { analyticsApi } from '@swipex/api';

interface AnalyticsState {
  candidateAnalytics: CandidateAnalyticsSummary | null;
  recruiterAnalytics: RecruiterAnalyticsSummary | null;
  timeRange: '7d' | '30d' | '90d' | 'all';
  isLoading: boolean;
  error: string | null;
  setTimeRange: (range: '7d' | '30d' | '90d' | 'all') => void;
  fetchCandidateAnalytics: (range?: '7d' | '30d' | '90d' | 'all') => Promise<void>;
  fetchRecruiterAnalytics: (range?: '7d' | '30d' | '90d' | 'all') => Promise<void>;
}

const EMPTY_CANDIDATE_ANALYTICS = (timeRange: '7d' | '30d' | '90d' | 'all'): CandidateAnalyticsSummary => ({
  careerScore: 0,
  profileCompletionPct: 0,
  totalJobsViewed: 0,
  jobsLiked: 0,
  jobsRejected: 0,
  jobsSaved: 0,
  applicationsSubmitted: 0,
  interviewsCount: 0,
  offersCount: 0,
  applicationSuccessRatePct: 0,
  timeRange,
  activityTimeline: [],
  funnel: [],
  topSkillsRequired: [],
  locationPreferences: [],
});

const EMPTY_RECRUITER_ANALYTICS = (timeRange: '7d' | '30d' | '90d' | 'all'): RecruiterAnalyticsSummary => ({
  activeJobsCount: 0,
  applicationsReceivedCount: 0,
  applicationsReviewedCount: 0,
  shortlistedCount: 0,
  interviewsCount: 0,
  hiringConversionPct: 0,
  avgApplicantMatchScore: 0,
  pipelineDistribution: [
    { stage: 'Applied', count: 0 },
    { stage: 'Reviewing', count: 0 },
    { stage: 'Shortlisted', count: 0 },
    { stage: 'Interview', count: 0 },
    { stage: 'Offer', count: 0 },
    { stage: 'Hired', count: 0 },
    { stage: 'Rejected', count: 0 },
  ],
  timeRange,
});

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  candidateAnalytics: null,
  recruiterAnalytics: null,
  timeRange: '30d',
  isLoading: false,
  error: null,

  setTimeRange: (timeRange) => {
    set({ timeRange });
    const current = get();
    if (current.recruiterAnalytics) {
      current.fetchRecruiterAnalytics(timeRange);
    } else {
      current.fetchCandidateAnalytics(timeRange);
    }
  },

  fetchCandidateAnalytics: async (range) => {
    const targetRange = range || get().timeRange;
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsApi.getCandidateAnalytics(targetRange);
      set({ candidateAnalytics: data, timeRange: targetRange });
    } catch (err: any) {
      console.warn('Failed to fetch candidate analytics from server:', err);
      set((state) => ({
        candidateAnalytics: state.candidateAnalytics || EMPTY_CANDIDATE_ANALYTICS(targetRange),
        error: 'Failed to load live career analytics.',
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecruiterAnalytics: async (range) => {
    const targetRange = range || get().timeRange;
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsApi.getRecruiterAnalytics(targetRange);
      set({ recruiterAnalytics: data, timeRange: targetRange });
    } catch (err: any) {
      console.warn('Failed to fetch recruiter analytics from server:', err);
      set((state) => ({
        recruiterAnalytics: state.recruiterAnalytics || EMPTY_RECRUITER_ANALYTICS(targetRange),
        error: 'Failed to load live recruiter analytics.',
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
