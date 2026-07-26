import { API_ENDPOINTS } from '@swipex/config';
import { 
  Job, JobFilters, SwipeDirection, Application, 
  SavedJob, PaginatedResponse, ApiResponse 
} from '@swipex/types';
import { api } from './client';

export const jobsApi = {
  getJobFeed: (page = 1, limit = 10) => 
    api.get<ApiResponse<PaginatedResponse<Job>>>(API_ENDPOINTS.JOBS.FEED, { params: { page, limit } }),
    
  getJobById: (id: string) => 
    api.get<ApiResponse<Job>>(API_ENDPOINTS.JOBS.DETAILS(id)),
    
  searchJobs: (query: string, filters?: JobFilters, page = 1) => 
    api.post<ApiResponse<PaginatedResponse<Job>>>(API_ENDPOINTS.JOBS.SEARCH, { query, filters, page }),
    
  swipeJob: (jobId: string, direction: SwipeDirection) => 
    api.post<ApiResponse<null>>(API_ENDPOINTS.JOBS.SWIPE, { jobId, direction }),
    
  saveJob: (jobId: string) => 
    api.post<ApiResponse<SavedJob>>(API_ENDPOINTS.JOBS.SAVE(jobId)),
    
  unsaveJob: (jobId: string) => 
    api.delete<ApiResponse<null>>(API_ENDPOINTS.JOBS.UNSAVE(jobId)),
    
  getSavedJobs: (page = 1) => 
    api.get<ApiResponse<PaginatedResponse<SavedJob>>>(API_ENDPOINTS.JOBS.SAVED, { params: { page } }),
    
  getApplications: (page = 1) => 
    api.get<ApiResponse<PaginatedResponse<Application>>>(API_ENDPOINTS.APPLICATIONS.LIST, { params: { page } }),
    
  createApplication: (jobId: string, data: any) => 
    api.post<ApiResponse<Application>>(API_ENDPOINTS.APPLICATIONS.CREATE, { jobId, ...data })
};
