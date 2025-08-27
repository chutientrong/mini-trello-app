import { apiClient } from '@/services';
import type {
  SendVerificationCodeRequest,
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
  RefreshTokenResponse,
  ValidateTokenResponse,
  User,
} from '../types/auth';

export class AuthAPI {

  // Send verification code
  static async sendVerificationCode(data: SendVerificationCodeRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/send-code', data, { skipAuth: true });
  }

  // Sign in
  static async signin(data: SigninRequest): Promise<SigninResponse> {
    return apiClient.post('/auth/signin', data, { skipAuth: true });
  }

  // Sign up
  static async signup(data: SignupRequest): Promise<SignupResponse> {
    return apiClient.post('/auth/signup', data, { skipAuth: true });
  }


  // Refresh token
  static async refreshToken(): Promise<RefreshTokenResponse> {
    return apiClient.post('/auth/refresh-token', {}, { skipAuth: true });
  }

  // Validate token
  static async validateToken(): Promise<ValidateTokenResponse> {
    return apiClient.get('/auth/validate-token');
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always clear local storage even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Get current user profile
  static async getProfile(): Promise<{ user: User }> {
    return apiClient.get('/auth/me');
  }
}
