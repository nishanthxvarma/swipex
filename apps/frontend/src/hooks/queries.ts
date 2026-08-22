import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, jobsApi, notificationsApi, resumeApi, analyticsApi } from '@swipex/api';
import { useAuthStore } from '@/stores/auth-store';

export const QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  dashboard: (role?: string) => ['dashboard', role || 'candidate'] as const,
  jobFeed: (page: number, limit: number) => ['jobs', 'feed', page, limit] as const,
  applications: (page: number) => ['applications', page] as const,
  savedJobs: ['jobs', 'saved'] as const,
  activeResume: ['resume', 'active'] as const,
  notifications: ['notifications', 'list'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  candidateAnalytics: (timeRange: string) => ['analytics', 'candidate', timeRange] as const,
  recruiterPipeline: ['recruiter', 'pipeline'] as const,
  recruiterCandidates: ['recruiter', 'candidates'] as const,
};

/**
 * Hook to retrieve candidate/user profile with instant cached placeholder data from auth store
 */
export function useUserProfile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      const p = await usersApi.getProfile();
      if (p && user) {
        setUser({
          ...user,
          fullName: p.fullName || p.full_name || user.fullName,
          headline: p.headline || user.headline,
          location: p.location || user.location,
          bio: p.bio || user.bio,
          skills: p.skills || user.skills,
          experiences: p.experiences || user.experiences,
          socialLinks: p.socialLinks || p.social_links || user.socialLinks,
        });
      }
      return p;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    placeholderData: user
      ? {
          fullName: user.fullName,
          headline: user.headline || '',
          location: user.location || '',
          bio: user.bio || '',
          skills: user.skills || [],
          experiences: user.experiences || [],
          socialLinks: user.socialLinks || [],
        }
      : undefined,
  });
}

/**
 * Hook for dashboard data (feed + applications for candidates, candidates + jobs for recruiters)
 */
export function useDashboardData(role?: string) {
  const user = useAuthStore((state) => state.user);
  const currentRole = role || user?.role || 'JOB_SEEKER';

  return useQuery({
    queryKey: QUERY_KEYS.dashboard(currentRole),
    queryFn: async () => {
      if (currentRole === 'RECRUITER') {
        const [candidateList, feedJobs] = await Promise.allSettled([
          usersApi.getCandidates(),
          jobsApi.getJobFeed(1, 20),
        ]);
        return {
          candidates: candidateList.status === 'fulfilled' ? candidateList.value || [] : [],
          jobs: feedJobs.status === 'fulfilled' ? feedJobs.value || [] : [],
          applications: [],
        };
      } else {
        const [feed, userApps] = await Promise.allSettled([
          jobsApi.getJobFeed(1, 10),
          jobsApi.getApplications(1),
        ]);
        return {
          jobs: feed.status === 'fulfilled' ? feed.value || [] : [],
          applications: userApps.status === 'fulfilled' ? userApps.value || [] : [],
          candidates: [],
        };
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for Job Feed
 */
export function useJobFeed(page = 1, limit = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.jobFeed(page, limit),
    queryFn: () => jobsApi.getJobFeed(page, limit),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for User Applications
 */
export function useUserApplications(page = 1) {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: QUERY_KEYS.applications(page),
    queryFn: () => jobsApi.getApplications(page),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for Saved Jobs
 */
export function useSavedJobs() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: QUERY_KEYS.savedJobs,
    queryFn: () => jobsApi.getSavedJobs(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Hook for Active Resume
 */
export function useActiveResume() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: QUERY_KEYS.activeResume,
    queryFn: () => resumeApi.getActiveResume(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
