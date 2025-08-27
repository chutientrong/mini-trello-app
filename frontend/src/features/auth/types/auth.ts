import type { BaseEntity } from '@/types';

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User extends BaseEntity {
  fullName?: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  githubConnected?: boolean;
  githubUsername?: string;
}

export interface SendVerificationCodeRequest {
  email: string;
  isSignup?: boolean;
}

export interface SigninRequest {
  email: string;
  verificationCode: string;
}

export interface SigninResponse {
  user: User;
  tokens: AuthTokens;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  verificationCode: string;
}

export interface SignupResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: User | null;
}

export interface VerifyEmailRequest {
  token: string;
}


