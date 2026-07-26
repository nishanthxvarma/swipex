// Common types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface SearchQuery {
  query?: string;
  filters?: Record<string, any>;
  page?: number;
  perPage?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardStats {
  totalApplications: number;
  savedJobs: number;
  interviews: number;
  profileStrength: number;
  resumeScore: number;
  weeklyProgress: number;
  matchPercentage: number;
}
