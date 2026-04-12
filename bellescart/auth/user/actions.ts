'use client';

import { useUserAuth, saveUserSession, clearUserSession } from './index';
import { UserProfile } from '@/types/auth';

export const useAuthActions = () => {
  const { user, loaded, isAuthenticated } = useUserAuth();

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.login(credentials);

      if (response.success && response.data?.user && response.data?.token) {
        saveUserSession(response.data.user, response.data.token, response.data.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.signup(data);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const verifyOtp = async (data: { email: string; otp: string }) => {
    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.verifyOtp(data);

      if (response.success && response.data?.user && response.data?.token) {
        saveUserSession(response.data.user, response.data.token, response.data.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const resendOtp = async (data: { email: string }) => {
    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.resendOtp(data);
      return response;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearUserSession();
    window.location.href = '/login';
  };

  return {
    user,
    loaded,
    isAuthenticated,
    login,
    signup,
    verifyOtp,
    resendOtp,
    logout,
  };
};
