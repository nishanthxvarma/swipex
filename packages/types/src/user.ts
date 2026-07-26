// User related types
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
