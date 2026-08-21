import { create } from 'zustand';
import {
  Notification,
  NotificationPreferences,
} from '@swipex/types';
import { notificationsApi } from '@swipex/api';

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
  notifications: [],
  unreadCount: 0,
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
      const res = await notificationsApi.getNotifications({ page: 1, perPage: 20 });
      if (res && Array.isArray(res.notifications)) {
        const unread = res.notifications.filter((n) => !n.isRead).length;
        set({ notifications: res.notifications, unreadCount: unread });
      } else {
        set({ notifications: [], unreadCount: 0 });
      }
    } catch {
      // Clean fallback with zero invented data
      set({ notifications: [], unreadCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unread = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount: unread };
    });
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Ignore network errors on background mark-as-read
    }
  },

  markAllAsRead: async () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      return { notifications: updated, unreadCount: 0 };
    });
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Ignore network errors on background mark-all-read
    }
  },

  dismissNotification: async (id: string) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      const unread = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount: unread };
    });
    try {
      await notificationsApi.dismissNotification(id);
    } catch {
      // Ignore network errors on dismiss
    }
  },

  updatePreferences: async (prefs: Partial<NotificationPreferences>) => {
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    }));
    try {
      await notificationsApi.updatePreferences(prefs);
    } catch {
      // Ignore
    }
  },
}));
