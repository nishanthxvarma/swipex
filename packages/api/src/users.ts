import { API_ENDPOINTS } from '@swipex/config';
import { Profile, DashboardStats, ApiResponse } from '@swipex/types';
import { api } from './client';

export const usersApi = {
  getProfile: async () => {
    try {
      return await api.get<any>(API_ENDPOINTS.USERS.PROFILE);
    } catch (err: any) {
      if (err.code === 'HTTP_404') {
        const res = await api.get<any>('/profile/me');
        return {
          id: String(res.id),
          userId: String(res.id),
          fullName: res.display_name,
          full_name: res.display_name,
          headline: res.experience_level || "Software Engineer",
          bio: res.bio,
          location: res.location || "Remote",
          skills: res.skills || [],
          experience_years: "",
          education: [],
          experiences: [],
          social_links: [],
          profile_completion: "80%"
        };
      }
      throw err;
    }
  },
    
  updateProfile: async (data: any) => {
    try {
      return await api.put<any>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    } catch (err: any) {
      if (err.code === 'HTTP_404') {
        const payload = {
          display_name: data.fullName || data.full_name || data.displayName,
          bio: data.bio || data.about,
          location: data.location,
          experience_level: data.headline,
          skills: data.skills || []
        };
        const res = await api.put<any>('/profile/me', payload);
        return {
          id: String(res.id),
          userId: String(res.id),
          fullName: res.display_name,
          full_name: res.display_name,
          headline: res.experience_level || "Software Engineer",
          bio: res.bio,
          location: res.location || "Remote",
          skills: res.skills || [],
          experience_years: "",
          education: [],
          experiences: [],
          social_links: [],
          profile_completion: "80%"
        };
      }
      throw err;
    }
  },
    
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
