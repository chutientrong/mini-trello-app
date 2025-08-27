import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthAPI } from '../services/auth';
import type { 
  SendVerificationCodeRequest, 
  SigninRequest, 
  SignupRequest,
} from '../types/auth';

// Authentication hooks
export const useSendVerificationCode = () => {
  return useMutation({
    mutationFn: (data: SendVerificationCodeRequest) => AuthAPI.sendVerificationCode(data),
  });
};

export const useSignin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SigninRequest) => AuthAPI.signin(data),
    onSuccess: (data) => {
      // Store user data in query cache
      queryClient.setQueryData(['auth', 'validateToken'], {
        valid: true,
        user: data.user,
      });
      
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: ['auth', 'validateToken'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SignupRequest) => AuthAPI.signup(data),
    onSuccess: () => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: ['auth', 'validateToken'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};



export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => AuthAPI.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


export const useValidateToken = () => {
  // Check if we have any token in localStorage
  const hasToken = !!localStorage.getItem('accessToken');
  
  return useQuery({
    queryKey: ['auth', 'validateToken'],
    queryFn: async () => {
      try {
        return await AuthAPI.validateToken();
      } catch {
        // Return a default response for invalid/expired tokens
        return { valid: false, user: null };
      }
    },
    enabled: hasToken, // Only run query if we have a token
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    // Don't retry on 401 errors
    retryOnMount: false,
  });
};
