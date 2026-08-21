import { API_ENDPOINTS } from '@swipex/config';
import { Profile, DashboardStats, ApiResponse } from '@swipex/types';
import { api } from './client';

export const usersApi = {
  getProfile: () => 
    api.get<ApiResponse<Profile>>(API_ENDPOINTS.USERS.PROFILE),
    
  updateProfile: (data: Partial<Profile>) => 
    api.patch<ApiResponse<Profile>>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
    
  getDashboardStats: () => 
    api.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.USERS.DASHBOARD_STATS),
    
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    // The client will handle removing Content-Type so the browser can set the correct boundary
    return api.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.USERS.UPLOAD_RESUME, 
      formData
    );
  },

  getCandidates: () =>
    api.get<any[]>('/users/candidates'),

  listAllUsers: () =>
    api.get<any[]>('/users/')
};
