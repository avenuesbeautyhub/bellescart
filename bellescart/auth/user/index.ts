'use client';

import { useEffect, useState } from 'react';
import { User } from '@/utils/types';
import { UserProfile } from '@/types/auth';

// User authentication keys
const AUTH_USER_KEY = 'bellescart_user';
const AUTH_TOKEN_KEY = 'bellescart_token';
const AUTH_REFRESH_TOKEN_KEY = 'bellescart_refresh_token';

export const getUserAuth = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = window.localStorage.getItem(AUTH_USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

export const getUserToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getUserRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
};

export const isUserAuthenticated = (): boolean => {
  return !!getUserAuth() && !!getUserToken();
};

export const saveUserSession = (user: UserProfile, token: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;

  const userToStore: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as 'user' | 'admin' || 'user',
  };

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToStore));
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (refreshToken) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearUserSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
};

export const useUserAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getUserAuth());
    setLoaded(true);
  }, []);

  return {
    user,
    loaded,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
  };
};

export const useRequireUserAuth = () => {
  const { user, isAuthenticated, loaded } = useUserAuth();

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      window.location.replace('/login');
    }
  }, [isAuthenticated, loaded]);

  return { user, isAuthenticated, loaded };
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getUserAuth());
    setLoaded(true);
  }, []);

  return {
    user,
    loaded,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
  };
};

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
