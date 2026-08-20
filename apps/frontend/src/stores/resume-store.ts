import { create } from 'zustand';
import {
  ActiveResumeResponse,
  ATSScoreResult,
  HealthReport,
  AiSuggestion,
  JobMatchResult,
  SkillGapAnalysis,
  JobRecommendation,
  ResumeVersion,
  ResumeAnalytics,
} from '@swipex/types';
import { ResumeApi, ApiClient } from '@swipex/api';
import { useAuthStore } from './auth-store';

const getApiClient = () => {
  const token = useAuthStore.getState().tokens?.accessToken || null;
  return new ApiClient(
    process.env.NEXT_PUBLIC_API_URL || 'https://swipex-backend.onrender.com/api/v1',
    () => token,
    (t) => {}
  );
};

interface ResumeState {
  activeResume: ActiveResumeResponse | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  successMessage: string | null;
  
  jobMatchResult: JobMatchResult | null;
  skillGap: SkillGapAnalysis | null;
  isMatchingJob: boolean;

  recommendations: JobRecommendation[];
  isLoadingRecommendations: boolean;

  analytics: ResumeAnalytics | null;
  isLoadingAnalytics: boolean;

  // Modals & UI state
  isUploadModalOpen: boolean;
  isPreviewModalOpen: boolean;
  isVersionsModalOpen: boolean;
  isJobMatchModalOpen: boolean;

  setUploadModalOpen: (open: boolean) => void;
  setPreviewModalOpen: (open: boolean) => void;
  setVersionsModalOpen: (open: boolean) => void;
  setJobMatchModalOpen: (open: boolean) => void;
  clearNotifications: () => void;

  fetchActiveResume: () => Promise<void>;
  uploadResume: (file: File) => Promise<boolean>;
  deleteResumeVersion: (id: string) => Promise<boolean>;
  setActiveVersion: (id: string) => Promise<boolean>;
  matchJob: (jobId?: string, jobDescription?: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  activeResume: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  successMessage: null,

  jobMatchResult: null,
  skillGap: null,
  isMatchingJob: false,

  recommendations: [],
  isLoadingRecommendations: false,

  analytics: null,
  isLoadingAnalytics: false,

  isUploadModalOpen: false,
  isPreviewModalOpen: false,
  isVersionsModalOpen: false,
  isJobMatchModalOpen: false,

  setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
  setPreviewModalOpen: (open) => set({ isPreviewModalOpen: open }),
  setVersionsModalOpen: (open) => set({ isVersionsModalOpen: open }),
  setJobMatchModalOpen: (open) => set({ isJobMatchModalOpen: open }),
  clearNotifications: () => set({ error: null, successMessage: null }),

  fetchActiveResume: async () => {
    set({ isLoading: true, error: null });
    try {
      const api = new ResumeApi(getApiClient());
      const data = await api.getActiveResume();
      set({ activeResume: data, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch active resume:', err);
      set({
        activeResume: null,
        isLoading: false,
        error: 'Failed to fetch active resume.',
      });
    }
  },

  uploadResume: async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      set({ error: 'File size exceeds maximum allowed limit of 5 MB.' });
      return false;
    }

    set({ isUploading: true, uploadProgress: 10, error: null, successMessage: null });
    const progressInterval = setInterval(() => {
      set((s) => ({ uploadProgress: Math.min(90, s.uploadProgress + 20) }));
    }, 200);

    try {
      const api = new ResumeApi(getApiClient());
      const res = await api.uploadResume(file);
      clearInterval(progressInterval);
      set({
        activeResume: res,
        isUploading: false,
        uploadProgress: 100,
        successMessage: `✓ '${file.name}' uploaded and analyzed successfully!`,
        isUploadModalOpen: false,
      });
      get().fetchRecommendations();
      get().fetchAnalytics();
      return true;
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Failed to upload resume:', err);
      set({
        isUploading: false,
        uploadProgress: 0,
        error: err?.message || 'Failed to upload resume. Please try again.',
      });
      return false;
    }
  },

  deleteResumeVersion: async (id: string) => {
    try {
      const api = new ResumeApi(getApiClient());
      await api.deleteResume(id);
      get().fetchActiveResume();
      set({ successMessage: 'Resume version deleted.' });
      return true;
    } catch (err: any) {
      set({ error: 'Failed to delete version.' });
      return false;
    }
  },

  setActiveVersion: async (id: string) => {
    set({ isLoading: true });
    try {
      const api = new ResumeApi(getApiClient());
      const res = await api.setActiveResume(id);
      set({ activeResume: res, isLoading: false, successMessage: 'Activated selected resume version.' });
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      return false;
    }
  },

  matchJob: async (jobId?: string, jobDescription?: string) => {
    set({ isMatchingJob: true, isJobMatchModalOpen: true });
    try {
      const api = new ResumeApi(getApiClient());
      const res = await api.matchJob({ jobId, jobDescription });
      set({
        jobMatchResult: res.matchResult,
        skillGap: res.skillGap,
        isMatchingJob: false,
      });
    } catch (err: any) {
      console.error('Failed to match job:', err);
      set({
        isMatchingJob: false,
        error: 'Failed to match job.',
      });
    }
  },

  fetchRecommendations: async () => {
    set({ isLoadingRecommendations: true });
    try {
      const api = new ResumeApi(getApiClient());
      const res = await api.getRecommendJobs();
      set({ recommendations: res, isLoadingRecommendations: false });
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      set({
        recommendations: [],
        isLoadingRecommendations: false,
        error: 'Failed to fetch recommendations.',
      });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoadingAnalytics: true });
    try {
      const api = new ResumeApi(getApiClient());
      const res = await api.getResumeAnalytics();
      set({ analytics: res, isLoadingAnalytics: false });
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      set({
        analytics: null,
        isLoadingAnalytics: false,
        error: 'Failed to fetch analytics.',
      });
    }
  },
}));

