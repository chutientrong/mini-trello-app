import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface ApiError {
  code: number;
  message: string;
}

// Request configuration
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available (cookies are sent automatically)
        // We still support Authorization header for backward compatibility
        const token = localStorage.getItem('accessToken');
        if (token && !(config as RequestConfig).skipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Enable credentials for cookies
        config.withCredentials = true;
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        // Handle authentication responses (signin, signup, refresh)
        if (response.data && typeof response.data === 'object' && 'tokens' in response.data) {
          const authResponse = response.data as { tokens?: { accessToken?: string } };
          if (authResponse.tokens?.accessToken) {
            // Store access token in localStorage
            localStorage.setItem('accessToken', authResponse.tokens.accessToken);
            console.log('Access token stored from response');
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle authentication errors - rely only on server response
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Try to refresh the token
            // Refresh token is stored in HttpOnly cookies and sent automatically
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
              withCredentials: true,
            });

            const { accessToken } = response.data.tokens;
            // Only store access token in localStorage, refresh token stays in HttpOnly cookies
            localStorage.setItem('accessToken', accessToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            processQueue(null, accessToken);
            return this.client(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            // Clear localStorage and redirect to signin
            localStorage.removeItem('accessToken');
            window.location.href = '/signin';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return {
        code: error.response.status,
        message: (error.response.data as ApiResponse<unknown>).message || 'An error occurred',
      };
    }
    
    if (error.request) {
      return {
        code: 0,
        message: 'Network error. Please check your connection.',
      };
    }
    
    return {
      code: 0,
      message: error.message || 'An unexpected error occurred',
    };
  }

  // Generic request methods
  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    // Handle both wrapped and unwrapped responses
    console.log(response.data);
    return (response.data) as T;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    // Handle both wrapped and unwrapped responses
    return (response.data) as T;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    // Handle both wrapped and unwrapped responses
    return (response.data) as T;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    // Handle both wrapped and unwrapped responses
    return (response.data) as T;
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    // Handle both wrapped and unwrapped responses
    return (response.data) as T;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
