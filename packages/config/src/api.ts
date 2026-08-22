export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://swipex-backend-i4vn.onrender.com/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE_OAUTH: '/auth/google',
    ME: '/auth/me'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DASHBOARD_STATS: '/users/dashboard-stats',
    UPLOAD_RESUME: '/users/resume'
  },
  JOBS: {
    FEED: '/jobs/feed',
    DETAILS: (id: string) => `/jobs/${id}`,
    SEARCH: '/jobs/search',
    SWIPE: '/jobs/swipe',
    SAVE: (id: string) => `/jobs/${id}/save`,
    UNSAVE: (id: string) => `/jobs/${id}/unsave`,
    SAVED: '/jobs/saved'
  },
  APPLICATIONS: {
    LIST: '/applications',
    CREATE: '/applications'
  }
};

export function createApiUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  let url = `${API_BASE_URL}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }
  return url;
}
