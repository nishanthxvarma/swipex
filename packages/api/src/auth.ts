import { API_ENDPOINTS } from '@swipex/config';
import { 
  LoginRequest, RegisterRequest, ForgotPasswordRequest, 
  ResetPasswordRequest
} from '@swipex/types';
import { api } from './client';

export interface BackendAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN' | string;
    fullName?: string;
  };
}

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data),
    
  register: (data: RegisterRequest) => 
    api.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data),
    
  refreshToken: (token: string) => 
    api.post<{ access_token: string; refresh_token: string }>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken: token }),
    
  forgotPassword: (data: ForgotPasswordRequest) => 
    api.post<any>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
    
  resetPassword: (data: ResetPasswordRequest) => 
    api.post<any>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data),
    
  googleOAuth: (token: string) => 
    api.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.GOOGLE_OAUTH, { token }),
    
  getCurrentUser: () => 
    api.get<any>(API_ENDPOINTS.AUTH.ME)
};
