'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { getUserToken, getUserRefreshToken, saveUserSession, clearUserSession } from '@/auth/user';
import { globalToast } from '@/utils/globalToast';

export function useCurrentUser() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        // Map backend _id to frontend id
        const userData = {
          ...response.data,
          id: response.data._id || response.data.id
        };
        return userData;
      }
      throw new Error('Failed to fetch user');
    },
    enabled: !!getUserToken() || !!getUserRefreshToken(),
    staleTime: 1000 * 60 * 10, // 10 minutes (increased to reduce refetches)
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    refetchOnWindowFocus: false, // Disabled to prevent 429 errors
    refetchOnReconnect: false, // Disabled to prevent 429 errors
    retry: (failureCount, error) => {
      // Don't retry on 429 errors
      if (error instanceof Error && error.message.includes('429')) {
        return false;
      }
      // Retry other errors up to 1 time
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, etc.
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user && response.data?.token) {
        saveUserSession(response.data.user, response.data.token, response.data.refreshToken);
        
        // Set welcome flag to show welcome overlay
        if (typeof window !== 'undefined') {
          localStorage.setItem('welcomeShown', 'false');
          window.dispatchEvent(new Event('auth-state-changed'));
        }
        
        return response.data.user;
      }
      throw new Error('Login failed');
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      clearUserSession();
      // Clear all user-related items from localStorage on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bellescart_theme');
        localStorage.removeItem('bellescart_language');
        localStorage.removeItem('bellescart_csrf_token');
        localStorage.removeItem('bellescart_user');
        localStorage.removeItem('bellescart_user_data');
        localStorage.removeItem('justLoggedIn');
        localStorage.removeItem('welcomeShown');
        // Dispatch auth state change event so providers know user logged out
        window.dispatchEvent(new Event('auth-state-changed'));
        window.dispatchEvent(new Event('storage'));
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      queryClient.clear();
      // Show logout success toast
      if (typeof window !== 'undefined') {
        globalToast.auth.logoutSuccess();
      }
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await authService.verifyOtp(data);
      if (response.success && response.data?.user && response.data?.token) {
        saveUserSession(response.data.user, response.data.token, response.data.refreshToken);
        
        // Trigger auth state change event to update UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-state-changed'));
        }
        
        return response.data.user;
      }
      throw new Error('OTP verification failed');
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
    }) => {
      const response = await authService.signup(data);
      return response;
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await authService.resendOtp(data);
      return response;
    },
  });
}