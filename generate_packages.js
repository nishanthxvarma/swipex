const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\nisha\\OneDrive\\Desktop\\swipex\\packages';

const files = {
  'types/package.json': `{
  "name": "@swipex/types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}`,
  'types/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}`,
  'types/src/index.ts': `export * from './user';\nexport * from './job';\nexport * from './common';`,
  'types/src/user.ts': `// User related types
export enum UserRole {
  admin = 'admin',
  recruiter = 'recruiter',
  job_seeker = 'job_seeker',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  skills: string[];
  experienceYears: number;
  education: Array<{ institution: string; degree: string; field: string; startYear: number; endYear?: number }>;
  certifications: string[];
  projects: Array<{ name: string; description: string; url?: string }>;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  profileCompletion: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  role: UserRole;
  fullName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
}
`,
  'types/src/job.ts': `// Job related types
export enum JobType {
  full_time = 'full_time',
  part_time = 'part_time',
  contract = 'contract',
  internship = 'internship',
}

export enum ExperienceLevel {
  entry = 'entry',
  mid = 'mid',
  senior = 'senior',
  lead = 'lead',
  executive = 'executive',
}

export enum SwipeDirection {
  left = 'left',
  right = 'right',
  up = 'up',
}

export enum ApplicationStatus {
  applied = 'applied',
  reviewing = 'reviewing',
  interview = 'interview',
  offer = 'offer',
  rejected = 'rejected',
  withdrawn = 'withdrawn',
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  industry: string;
  size: string;
  website?: string;
  techStack: string[];
  culture?: string;
  benefits: string[];
  rating: number;
  employeeCount: number;
  foundedYear: number;
  headquarters: string;
}

export interface Job {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  skillsPreferred: string[];
  benefits: string[];
  applicationDeadline?: string;
  isActive: boolean;
  viewsCount: number;
  applicationsCount: number;
  postedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  atsScore?: number;
  appliedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  savedAt: string;
}

export interface Swipe {
  id: string;
  userId: string;
  jobId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface JobFilters {
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: ExperienceLevel[];
  jobType?: JobType[];
  isRemote?: boolean;
  skills?: string[];
  companySize?: string[];
  industry?: string[];
  postedAfter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
`,
  'types/src/common.ts': `// Common types
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
`,
  'utils/package.json': `{
  "name": "@swipex/utils",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}`,
  'utils/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}`,
  'utils/src/index.ts': `export * from './formatters';\nexport * from './validators';\nexport * from './constants';`,
  'utils/src/formatters.ts': `/** Formats a salary range */
export function formatSalary(min?: number, max?: number, currency: string = '$'): string {
  if (!min && !max) return 'Not specified';
  const formatNum = (num: number) => num >= 1000 ? \`\${Math.round(num / 1000)}K\` : num.toString();
  if (min && !max) return \`\${currency}\${formatNum(min)}+\`;
  if (!min && max) return \`Up to \${currency}\${formatNum(max)}\`;
  return \`\${currency}\${formatNum(min!)} - \${currency}\${formatNum(max!)}\`;
}

/** Formats date into relative time string */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return \`\${diffInMinutes} minute\${diffInMinutes > 1 ? 's' : ''} ago\`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return \`\${diffInHours} hour\${diffInHours > 1 ? 's' : ''} ago\`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return \`\${diffInDays} day\${diffInDays > 1 ? 's' : ''} ago\`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return \`\${diffInMonths} month\${diffInMonths > 1 ? 's' : ''} ago\`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return \`\${diffInYears} year\${diffInYears > 1 ? 's' : ''} ago\`;
}

/** Formats company size text */
export function formatCompanySize(size: string | number): string {
  if (typeof size === 'number') {
    if (size < 50) return '1-50 employees';
    if (size < 200) return '51-200 employees';
    if (size < 1000) return '201-1,000 employees';
    if (size < 5000) return '1,001-5,000 employees';
    return '5,000+ employees';
  }
  return size;
}

/** Truncates text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/** Generates initials from name */
export function generateInitials(name: string): string {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Formats number to compact string like 1.2K */
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\\.0$/, '') + 'K';
  return (num / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M';
}
`,
  'utils/src/validators.ts': `/** Validates email format */
export function isValidEmail(email: string): boolean {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}

/** Validates password strength */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/** Validates URL format */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}
`,
  'utils/src/constants.ts': `// App constants
export const APP_NAME = 'SwipeX';
export const APP_DESCRIPTION = 'AI-powered swipe-based job discovery platform';
export const APP_URL = 'https://swipex.example.com';

export const ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  JOB_SEEKER: 'job_seeker'
} as const;

export const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship'] as const;
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'] as const;

export const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'C#', 'C++', 'Ruby', 'Go',
  'PHP', 'Swift', 'Kotlin', 'Rust', 'SQL',
  'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'GraphQL', 'REST API', 'Vue.js', 'Angular', 'Svelte',
  'Tailwind CSS', 'HTML', 'CSS', 'Sass', 'Less',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux',
  'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas',
  'Agile', 'Scrum', 'Jira', 'Figma', 'UI/UX'
];

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Manufacturing', 'Retail', 'Media', 'Entertainment', 'Real Estate'
];

export const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const SWIPE_THRESHOLD = 120; // pixels for swipe detection
`,
  'config/package.json': `{
  "name": "@swipex/config",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}`,
  'config/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}`,
  'config/src/index.ts': `export * from './api';`,
  'config/src/api.ts': `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
    DETAILS: (id: string) => \`/jobs/\${id}\`,
    SEARCH: '/jobs/search',
    SWIPE: '/jobs/swipe',
    SAVE: (id: string) => \`/jobs/\${id}/save\`,
    UNSAVE: (id: string) => \`/jobs/\${id}/unsave\`,
    SAVED: '/jobs/saved'
  },
  APPLICATIONS: {
    LIST: '/applications',
    CREATE: '/applications'
  }
};

export function createApiUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  let url = \`\${API_BASE_URL}\${endpoint}\`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    url += \`?\${searchParams.toString()}\`;
  }
  return url;
}
`,
  'hooks/package.json': `{
  "name": "@swipex/hooks",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": {
    "react": "^18.2.0 || ^19.0.0"
  }
}`,
  'hooks/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`,
  'hooks/src/index.ts': `export * from './use-debounce';
export * from './use-local-storage';
export * from './use-media-query';
export * from './use-click-outside';
export * from './use-keyboard-shortcut';
`,
  'hooks/src/use-debounce.ts': `import { useState, useEffect } from 'react';

/**
 * Hook for debouncing a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
`,
  'hooks/src/use-local-storage.ts': `import { useState, useEffect } from 'react';

/**
 * Hook for interacting with localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue];
}
`,
  'hooks/src/use-media-query.ts': `import { useState, useEffect } from 'react';

/**
 * Hook for checking media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Support modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}
`,
  'hooks/src/use-click-outside.ts': `import { useEffect, RefObject } from 'react';

/**
 * Hook to detect clicks outside of a specified element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
`,
  'hooks/src/use-keyboard-shortcut.ts': `import { useEffect } from 'react';

interface ShortcutOptions {
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

/**
 * Hook to listen for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { altKey = false, ctrlKey = false, shiftKey = false, metaKey = false } = options;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.altKey === altKey &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, callback, options]);
}
`,
  'api/package.json': `{
  "name": "@swipex/api",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@swipex/config": "workspace:*",
    "@swipex/types": "workspace:*"
  }
}`,
  'api/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": [
    { "path": "../types" },
    { "path": "../config" }
  ]
}`,
  'api/src/index.ts': `export * from './client';
export * from './auth';
export * from './jobs';
export * from './users';
`,
  'api/src/client.ts': `import { API_BASE_URL } from '@swipex/config';
import { ApiResponse, ApiError } from '@swipex/types';

interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private setToken: (token: string | null) => void;
  private handleRefresh: () => Promise<string | null>;

  constructor(
    baseUrl = API_BASE_URL,
    getToken = () => null,
    setToken = (_token: string | null) => {},
    handleRefresh = async () => null
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
    this.setToken = setToken;
    this.handleRefresh = handleRefresh;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...restConfig } = config;
    
    let url = \`\${this.baseUrl}\${endpoint}\`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += \`?\${qs}\`;
    }

    const token = this.getToken();
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...(headers as Record<string, string> || {})
    };

    try {
      let response = await fetch(url, {
        ...restConfig,
        headers: defaultHeaders
      });

      // Handle 401 Unauthorized for token refresh
      if (response.status === 401 && token) {
        const newToken = await this.handleRefresh();
        if (newToken) {
          defaultHeaders['Authorization'] = \`Bearer \${newToken}\`;
          response = await fetch(url, {
            ...restConfig,
            headers: defaultHeaders
          });
        }
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error: ApiError = {
          code: data?.code || 'UNKNOWN_ERROR',
          message: data?.message || response.statusText || 'An error occurred',
          details: data?.details
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      if ((error as ApiError).code) throw error;
      
      const genericError: ApiError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
      throw genericError;
    }
  }

  public get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body instanceof FormData ? body as any : JSON.stringify(body),
      headers: body instanceof FormData ? { 'Content-Type': undefined as any } : undefined
    });
  }

  public put<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body instanceof FormData ? body as any : JSON.stringify(body)
    });
  }

  public patch<T>(endpoint: string, body?: any, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body instanceof FormData ? body as any : JSON.stringify(body)
    });
  }

  public delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Global instance to be initialized by the application
export const api = new ApiClient();
`,
  'api/src/auth.ts': `import { API_ENDPOINTS } from '@swipex/config';
import { 
  LoginRequest, RegisterRequest, ForgotPasswordRequest, 
  ResetPasswordRequest, AuthTokens, User, ApiResponse 
} from '@swipex/types';
import { api } from './client';

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(API_ENDPOINTS.AUTH.LOGIN, data),
    
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(API_ENDPOINTS.AUTH.REGISTER, data),
    
  refreshToken: (token: string) => 
    api.post<ApiResponse<AuthTokens>>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken: token }),
    
  forgotPassword: (data: ForgotPasswordRequest) => 
    api.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
    
  resetPassword: (data: ResetPasswordRequest) => 
    api.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
    
  googleOAuth: (token: string) => 
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(API_ENDPOINTS.AUTH.GOOGLE_OAUTH, { token }),
    
  getCurrentUser: () => 
    api.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
};
`,
  'api/src/jobs.ts': `import { API_ENDPOINTS } from '@swipex/config';
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
`,
  'api/src/users.ts': `import { API_ENDPOINTS } from '@swipex/config';
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
  }
};
`,
  'shared/package.json': `{
  "name": "@swipex/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}`,
  'shared/tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}`,
  'shared/src/index.ts': `export * from './animations';`,
  'shared/src/animations.ts': `import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: '100%', transition: { duration: 0.3 } }
};

export const slideDown: Variants = {
  hidden: { y: '-100%' },
  visible: { y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: '-100%', transition: { duration: 0.3 } }
};

export const slideLeft: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '100%', transition: { duration: 0.3 } }
};

export const slideRight: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '-100%', transition: { duration: 0.3 } }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'backOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const scaleOut: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'backOut' } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export const springConfig = {
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  smooth: { type: 'spring', stiffness: 300, damping: 20 },
  stiff: { type: 'spring', stiffness: 500, damping: 30 }
};

export const cardSwipeVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springConfig.smooth },
  exit: (direction: number) => ({
    x: direction > 0 ? 300 : direction < 0 ? -300 : 0,
    y: direction === 0 ? -300 : 50,
    opacity: 0,
    rotate: direction > 0 ? 15 : direction < 0 ? -15 : 0,
    transition: { duration: 0.3 }
  })
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } }
};

export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 5 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, y: 5, transition: { duration: 0.15, ease: 'easeIn' } }
};

export const skeletonPulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
}

console.log('All packages created successfully!');
