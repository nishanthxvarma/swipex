import { API_ENDPOINTS } from '@swipex/config';
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
