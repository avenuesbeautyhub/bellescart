'use client';

import { useEffect, useState } from 'react';
import { User } from '@/utils/types';
import { UserProfile } from '@/types/auth';

// Admin authentication keys (separate from user auth)
const ADMIN_USER_KEY = 'bellescart_admin_user';
const ADMIN_TOKEN_KEY = 'bellescart_admin_token';

// Token validation helpers
export const isTokenValid = (token: string): boolean => {
  if (!token) {
    console.warn('Token validation failed: No token provided');
    return false;
  }
  
  try {
    // Check if token has proper JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token validation failed: Invalid JWT format - expected 3 parts, got', parts.length);
      return false;
    }
    
    // Simple JWT validation - check if token is not expired
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    if (!payload.exp) {
      console.warn('Token validation failed: No expiration claim in token');
      return false;
    }
    
    const isValid = payload.exp > currentTime;
    if (!isValid) {
      console.warn('Token validation failed: Token expired at', new Date(payload.exp * 1000).toISOString());
    }
    
    return isValid;
  } catch (error) {
    console.error('Token validation failed with error:', error);
    return false;
  }
};

export const getAdminAuth = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = window.localStorage.getItem(ADMIN_USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  console.log('getAdminToken called:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    storageKeys: Object.keys(localStorage)
  });
  return token;
};

export const isAdminAuthenticated = (): boolean => {
  const token = getAdminToken();
  const user = getAdminAuth();

  // Must have both token and user data, and token must be valid
  if (!token || !user) return false;

  // Validate token expiration
  return isTokenValid(token);
};

export const saveAdminSession = (user: UserProfile, token: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;

  console.log('saveAdminSession called:', {
    user,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    hasRefreshToken: !!refreshToken
  });

  const userToStore: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as 'user' | 'admin' || 'admin', // Force admin role
  };

  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(userToStore));
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);

  console.log('Session saved, verifying:', {
    savedUser: window.localStorage.getItem(ADMIN_USER_KEY),
    savedToken: window.localStorage.getItem(ADMIN_TOKEN_KEY)?.substring(0, 20) + '...',
    storageKeys: Object.keys(localStorage)
  });
};

export const clearAdminSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_USER_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadAuthState = () => {
    console.log('useAdminAuth: loadAuthState called');
    const adminAuth = getAdminAuth();
    const adminToken = getAdminToken();
    const isAuthenticated = isAdminAuthenticated();
    
    console.log('useAdminAuth: auth state loaded:', {
      adminAuth,
      adminToken: adminToken?.substring(0, 20) + '...',
      isAuthenticated,
      loaded: true
    });
    
    setUser(adminAuth);
    setLoaded(true);
  };

  useEffect(() => {
    // Load admin session on mount
    console.log('useAdminAuth: useEffect called');
    loadAuthState();
  }, []);

  return {
    user,
    loaded,
    isAuthenticated: isAdminAuthenticated(),
    isAdmin: !!user && user.role === 'admin',
    refetch: loadAuthState,
  };
};

export const useRequireAdminAuth = () => {
  const { user, isAuthenticated, loaded } = useAdminAuth();

  useEffect(() => {
    console.log('useRequireAdminAuth effect:', {
      loaded,
      isAuthenticated,
      user,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
    });

    if (loaded && !isAuthenticated && typeof window !== 'undefined') {
      // Check if we're on login or register page to avoid redirect loop
      const currentPath = window.location.pathname;
      console.log('useRequireAdminAuth: Redirecting to login due to failed auth');
      if (currentPath !== '/belles-portel-25' && currentPath !== '/belles-portel-25/register') {
        window.location.replace('/belles-portel-25');
      }
    }
  }, [loaded, isAuthenticated]);

  return { user, isAuthenticated, loaded };
};

// Combined admin auth utilities
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check both user and admin sessions
    const userAuth = localStorage.getItem('bellescart_token');
    const adminAuth = getAdminAuth();

    // Priority: admin session over user session
    let currentUser: User | null = adminAuth;
    if (!currentUser && userAuth) {
      try {
        currentUser = JSON.parse(localStorage.getItem('bellescart_user') || '{}');
      } catch {
        currentUser = null;
      }
    }

    setUser(currentUser);
    setLoaded(true);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return {
    user,
    loaded,
    isAuthenticated,
    isAdmin,
    // Admin specific methods
    saveAdminSession,
    clearAdminSession,
    getAdminToken,
    // User specific methods (for admin pages that might need them)
    saveUserSession: (user: UserProfile, token: string, refreshToken?: string) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem('bellescart_user', JSON.stringify(user));
      window.localStorage.setItem('bellescart_token', token);

    },
    clearUserSession: () => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem('bellescart_user');
      window.localStorage.removeItem('bellescart_token');
    }
  };
};
