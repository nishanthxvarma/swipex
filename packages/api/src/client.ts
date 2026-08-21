import { API_BASE_URL } from '@swipex/config';
import { ApiResponse, ApiError } from '@swipex/types';

interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
}

function defaultGetToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('swipex-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.state?.tokens?.accessToken || parsed?.state?.tokens?.access_token || null;
      }
    } catch (e) {
      console.error('Error reading auth token from localStorage', e);
    }
  }
  return null;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private setToken: (token: string | null) => void;
  private handleRefresh: () => Promise<string | null>;

  constructor(
    baseUrl = API_BASE_URL,
    getToken: () => string | null = defaultGetToken,
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
    
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const token = this.getToken();
    const isFormData = typeof FormData !== 'undefined' && restConfig.body instanceof FormData;
    const defaultHeaders: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> || {})
    };
    if (!isFormData && !defaultHeaders['Content-Type']) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
      let response = await fetch(url, {
        ...restConfig,
        headers: defaultHeaders
      });

      // Handle 401 Unauthorized for token refresh
      if (response.status === 401 && token) {
        const newToken = await this.handleRefresh();
        if (newToken) {
          defaultHeaders['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...restConfig,
            headers: defaultHeaders
          });
        }
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = '';
        if (data) {
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
          } else if (typeof data.message === 'string') {
            errorMsg = data.message;
          }
        }
        if (!errorMsg && response.statusText) {
          errorMsg = response.statusText;
        }
        if (!errorMsg) {
          errorMsg = `Request failed with status ${response.status}`;
        }

        const error: ApiError = {
          code: data?.code || `HTTP_${response.status}`,
          message: errorMsg,
          details: data?.details || data?.detail
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
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  public put<T>(endpoint: string, body?: any, config?: RequestConfig) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  public patch<T>(endpoint: string, body?: any, config?: RequestConfig) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  public delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Global instance to be initialized by the application
export const api = new ApiClient();
