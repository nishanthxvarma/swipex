import { create } from 'zustand';
import {
  Notification,
  NotificationPreferences,
} from '@swipex/types';

const MOCK_INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_1',
    userId: 'usr_1',
    type: 'job_matched',
    title: 'New 95% Job Match!',
    message: 'Vercel posted Senior Frontend Engineer in Remote.',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    metadata: { jobId: 'job_101' },
  },
  {
    id: 'n_2',
    userId: 'usr_1',
    type: 'interview_scheduled',
    title: 'Interview Confirmed 🎉',
    message: 'Google technical interview scheduled for Thursday 2:00 PM.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { applicationId: 'app_202' },
  },
  {
    id: 'n_3',
    userId: 'usr_1',
    type: 'application_viewed',
    title: 'Application Viewed by Recruiter',
    message: 'Stripe talent acquisition team viewed your resume.',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metadata: { applicationId: 'app_303' },
  },
  {
    id: 'n_4',
    userId: 'usr_1',
    type: 'ats_analysis_completed',
    title: 'ATS Resume Analysis Completed',
    message: 'Your resume received an 88.5 ATS Compatibility Score.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  preferences: NotificationPreferences;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: MOCK_INITIAL_NOTIFICATIONS,
  unreadCount: MOCK_INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,
  isLoading: false,
  preferences: {
    jobRecommendations: true,
    applications: true,
    interviews: true,
    recruiterActivity: true,
    analytics: true,
    systemNotifications: true,
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // If backend API token available, call backend
      const token = typeof window !== 'undefined' ? localStorage.getItem('swipex-auth-storage') : null;
      if (token && token.includes('accessToken')) {
        // Attempt backend fetch or fallback gracefully to current state
      }
      const unread = get().notifications.filter((n) => !n.isRead).length;
      set({ unreadCount: unread });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unread = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount: unread };
    });
  },

  markAllAsRead: async () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      return { notifications: updated, unreadCount: 0 };
    });
  },

  dismissNotification: async (id: string) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      const unread = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount: unread };
    });
  },

  updatePreferences: async (prefs: Partial<NotificationPreferences>) => {
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    }));
  },
}));
