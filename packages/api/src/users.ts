import { API_ENDPOINTS } from '@swipex/config';
import { Profile, DashboardStats, ApiResponse } from '@swipex/types';
import { api } from './client';

export const usersApi = {
  getProfile: () => 
    api.get<any>(API_ENDPOINTS.USERS.PROFILE),
    
  updateProfile: (data: any) => 
    api.put<any>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
    
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

  recordCandidateAction: (payload: { candidateId: string; action: 'pass' | 'shortlist' | 'interest'; jobId?: string; notes?: string }) =>
    api.post<any>('/users/candidates/action', payload),

  listAllUsers: () =>
    api.get<any[]>('/admin/users'),

  getAdminRecruiters: () =>
    api.get<any[]>('/admin/recruiters'),

  verifyRecruiter: (id: string) =>
    api.put<any>(`/admin/recruiters/${id}/verify`, {}),

  setRecruiterStatus: (id: string, status: string) =>
    api.put<any>(`/admin/recruiters/${id}/status`, { status }),

  getAdminActivity: (type = 'ALL', page = 1) =>
    api.get<any[]>('/admin/activity', { params: { type, page } }),

  updateUserStatus: (id: string, status: string) =>
    api.put<any>(`/admin/users/${id}/status`, { status })
};
