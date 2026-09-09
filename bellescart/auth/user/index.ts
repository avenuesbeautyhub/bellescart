'use client';

import { useEffect, useState, useRef } from 'react';
import { User } from '@/utils/types';
import { UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';

// Export React Query hooks
export { useAuthWithQuery } from '@/hooks/user/useAuthWithQuery';
export { useCurrentUser, useLogin, useLogout, useVerifyOtp, useSignup, useResendOtp } from '@/hooks/user/useAuthQuery';

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

export const getCachedUserData = (): User | null => {
  // User data is no longer cached locally - fetched from API via React Query
  return null;
};

export const useUserAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check for tokens first
    const token = getUserToken();
    const refreshToken = getUserRefreshToken();
    
    // Only set loaded to true if we have tokens or have tried to load user data
    if (token || refreshToken) {
      setLoaded(true);
    } else {
      // No tokens, set loaded to true to allow redirect
      setLoaded(true);
    }
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
  const hasFetched = useRef(false);

  useEffect(() => {
    const updateAuthState = async () => {
      const token = getUserToken();
      const refreshToken = getUserRefreshToken();

      // Always set loaded to true immediately to prevent infinite loading
      setLoaded(true);

      // Only fetch if we have a token and haven't fetched yet
      if (token && !hasFetched.current) {
        hasFetched.current = true;
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            // Map backend _id to frontend id
            const userData = {
              ...response.data,
              id: response.data._id || response.data.id
            };
            setUser(userData as User);
          } else {
            // If token is invalid, clear it
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          // Don't set user to null on error during development
          // This prevents redirect to login on API errors
          if (process.env.NODE_ENV === 'development') {
            console.warn('Development mode: Keeping auth state on API error');
          } else {
            setUser(null);
          }
        }
      } else if (!token) {
        // No token, clear user
        setUser(null);
        hasFetched.current = false; // Reset for when user logs in
      }
    };

    updateAuthState();

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      setUser(null); // Reset user on storage change, will refetch
      hasFetched.current = false; // Allow refetch
      updateAuthState();
    };

    // Listen for auth state changes (login/logout)
    const handleAuthStateChange = () => {
      setUser(null); // Reset user on auth change, will refetch
      hasFetched.current = false; // Allow refetch
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []); // Empty dependency array - only run on mount

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
          localStorage.setItem('justLoggedIn', 'true');
          // Force immediate auth state update
          window.dispatchEvent(new Event('auth-state-changed'));
          window.dispatchEvent(new Event('storage'));
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
          localStorage.setItem('welcomeShown', 'false');
          localStorage.setItem('justLoggedIn', 'true');
          window.dispatchEvent(new Event('auth-state-changed'));
          window.dispatchEvent(new Event('storage'));
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

    // Clear login-related flags
    if (typeof window !== 'undefined') {
      localStorage.removeItem('justLoggedIn');
      localStorage.removeItem('welcomeShown');
      window.dispatchEvent(new Event('auth-state-changed'));
      window.dispatchEvent(new Event('storage'));
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
