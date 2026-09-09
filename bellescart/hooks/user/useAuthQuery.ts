'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { getUserToken, getUserRefreshToken, saveUserSession, clearUserSession } from '@/auth/user';

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
    retry: 0, // Disabled retries to prevent error cascades
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-state-changed'));
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      queryClient.clear();
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