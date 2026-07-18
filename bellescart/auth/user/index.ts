'use client';

import { useEffect, useState } from 'react';
import { User } from '@/utils/types';
import { UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';

// User authentication keys - only tokens needed
const AUTH_TOKEN_KEY = 'bellescart_token';
const AUTH_REFRESH_TOKEN_KEY = 'bellescart_refresh_token';

export const getUserToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getUserRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
};

export const isUserAuthenticated = (): boolean => {
  const token = getUserToken();
  const refreshToken = getUserRefreshToken();

  // Consider authenticated if at least one valid token exists
  // (API interceptor will handle token refresh when needed)
  return !!token || !!refreshToken;
};

export const saveUserSession = (user: UserProfile, token: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;

  // Only store tokens - user data will be fetched from API when needed
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (refreshToken) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearUserSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
};

export const useUserAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // User data will be fetched from API when needed
    // For now, just set loaded to true
    setLoaded(true);
  }, []);

  // Get authentication status from tokens only
  const isAuthenticated = isUserAuthenticated();

  return { user, isAuthenticated, loaded };
};

export const useRequireUserAuth = () => {
  const { user, isAuthenticated, loaded } = useUserAuth();

  useEffect(() => {
    // Only redirect if loaded and not authenticated
    // This prevents redirect loops during initial load
    if (loaded && !isAuthenticated) {
      // Check if we're already on login page to prevent loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
  }, [loaded, isAuthenticated]);

  return { user, isAuthenticated, loaded };
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const updateAuthState = async () => {
      const token = getUserToken();
      const refreshToken = getUserRefreshToken();

      // Fetch current user data if we have a token
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data as User);
          } else {
            // If token is invalid, clear it
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          setUser(null);
        }
      } else {
        // No token, clear user
        setUser(null);
      }

      // Only set loaded to true after checking tokens and fetching user
      setLoaded(true);
    };

    updateAuthState();

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      updateAuthState();
    };

    // Listen for auth state changes (login/logout)
    const handleAuthStateChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  // Get current tokens for validation
  const token = getUserToken();
  const refreshToken = getUserRefreshToken();

  // Consider authenticated if at least one valid token exists
  const isAuthenticated = !!token || !!refreshToken;

  return {
    user,
    loaded,
    isAuthenticated,
    isAdmin: !!user && user.role === 'admin',
  };
};

export const useAuthActions = () => {
  const { user, loaded, isAuthenticated } = useAuth();

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authService.login(credentials);

      if (response.success && response.data?.user && response.data?.token) {
        saveUserSession(response.data.user, response.data.token, response.data.refreshToken);

        // Set welcome flag to show welcome overlay
        if (typeof window !== 'undefined') {
          localStorage.setItem('welcomeShown', 'false');
          window.dispatchEvent(new Event('auth-state-changed'));
        }
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
      const response = await authService.signup(data);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const verifyOtp = async (data: { email: string; otp: string }) => {
    try {
      const response = await authService.verifyOtp(data);

      if (response.success && response.data?.user && response.data?.token) {
        saveUserSession(response.data.user, response.data.token, response.data.refreshToken);

        // Trigger auth state change event to update UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-state-changed'));
        }
      }

      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const resendOtp = async (data: { email: string }) => {
    try {
      const response = await authService.resendOtp(data);
      return response;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearUserSession();

    // Trigger auth state change event to update UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-state-changed'));
    }

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
