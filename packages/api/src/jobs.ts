import { API_ENDPOINTS } from '@swipex/config';
import { 
  Job, JobFilters, SwipeDirection, Application, 
  SavedJob
} from '@swipex/types';
import { api } from './client';

function normalizeJob(raw: any) {
  if (!raw) return null;
  const item = raw.job ? raw.job : raw;
  const companyName = item.company?.name || item.company || "Tech Corp";
  const salaryMin = item.salary_min || item.salaryMin;
  const salaryMax = item.salary_max || item.salaryMax;
  
  let salaryStr = item.salary;
  if (!salaryStr) {
    if (salaryMin && salaryMax) {
      salaryStr = `$${Math.round(salaryMin / 1000)}k - $${Math.round(salaryMax / 1000)}k`;
    } else {
      salaryStr = "$130,000 - $170,000";
    }
  }

  return {
    id: String(item.id),
    title: item.title || "Software Engineer",
    company: companyName,
    companyInitials: companyName.substring(0, 2).toUpperCase(),
    location: item.location || "Remote",
    salary: salaryStr,
    type: item.job_type || item.jobType || "Full-time",
    matchPercentage: raw.match_score ? Math.min(98, 75 + raw.match_score * 4) : (item.matchPercentage || 88),
    atsScore: item.atsScore || 85,
    description: item.description || "",
    requirements: Array.isArray(item.skills) ? item.skills : (item.requirements || ["React", "TypeScript", "Node.js"]),
    skills: Array.isArray(item.skills) ? item.skills : (item.skillsRequired || ["React", "TypeScript"]),
    verified: true,
    color: item.color || "#635BFF",
    postedTime: item.postedTime || "Recently",
  };
}

export const jobsApi = {
  getJobFeed: async (page = 1, limit = 10): Promise<any[]> => {
    try {
      const res = await api.get<any[]>(API_ENDPOINTS.JOBS.FEED, { params: { page, limit } });
      if (Array.isArray(res) && res.length > 0) {
        return res.map(normalizeJob).filter(Boolean);
      }
    } catch (e) {
      // Ignore and fallback
    }

    try {
      const fallback = await api.get<any[]>('/jobs/recommendations');
      if (Array.isArray(fallback) && fallback.length > 0) {
        return fallback.map(normalizeJob).filter(Boolean);
      }
    } catch (err) {
      console.error('Fallback feed error:', err);
    }
    return [];
  },

  getJobById: (id: string) => 
    api.get<Job>(API_ENDPOINTS.JOBS.DETAILS(id)),
    
  searchJobs: (query: string, filters?: JobFilters, page = 1) => 
    api.post<Job[]>(API_ENDPOINTS.JOBS.SEARCH, { query, filters, page }),
    
  swipeJob: (jobId: string, direction: SwipeDirection | 'left' | 'right' | 'up') => 
    api.post<{ success: boolean }>(API_ENDPOINTS.JOBS.SWIPE, { jobId, direction }),
    
  saveJob: (jobId: string) => 
    api.post<SavedJob>(API_ENDPOINTS.JOBS.SAVE(jobId)),
    
  unsaveJob: (jobId: string) => 
    api.delete<{ success: boolean }>(API_ENDPOINTS.JOBS.UNSAVE(jobId)),
    
  getSavedJobs: async (page = 1): Promise<any[]> => {
    try {
      const res = await api.get<any[]>(API_ENDPOINTS.JOBS.SAVED, { params: { page } });
      if (Array.isArray(res)) return res.map(normalizeJob).filter(Boolean);
    } catch (e) {
      // Fallback cleanly to empty list if endpoint returns 404/422
    }
    return [];
  },
    
  getApplications: async (page = 1): Promise<any[]> => {
    try {
      const res = await api.get<any[]>(API_ENDPOINTS.APPLICATIONS.LIST, { params: { page } });
      if (Array.isArray(res)) return res;
    } catch (e) {
      // Fallback to legacy applications endpoint
    }

    try {
      const fallback = await api.get<any[]>('/applications/mine');
      if (Array.isArray(fallback)) return fallback;
    } catch (err) {
      console.error('Fallback applications error:', err);
    }
    return [];
  },
    
  createApplication: (jobId: string, data: any) => 
    api.post<Application>(API_ENDPOINTS.APPLICATIONS.CREATE, { jobId, ...data }),

  applyToJob: (jobId: string, data?: any) =>
    api.post<Application>(API_ENDPOINTS.APPLICATIONS.CREATE, { jobId, ...(data || {}) }),

  getUserApplications: (page = 1) => jobsApi.getApplications(page),

  createJob: (data: any) =>
    api.post<Job>('/jobs/', data),

  updateApplicationStatus: (id: string, status: string) =>
    api.put<Application>(`/applications/${id}/status`, { status }),

  getRecruiterPipeline: () =>
    api.get<any[]>('/applications/recruiter/pipeline')
};
