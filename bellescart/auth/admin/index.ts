'use client';

import { useEffect, useState } from 'react';
import { User } from '@/utils/types';
import { UserProfile } from '@/types/auth';

// Admin authentication keys (separate from user auth)
const ADMIN_USER_KEY = 'bellescart_admin_user';
const ADMIN_TOKEN_KEY = 'bellescart_admin_token';

// Token validation helpers
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  try {
    // Simple JWT validation - check if token is not expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
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

  const userToStore: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as 'user' | 'admin' || 'admin', // Force admin role
  };

  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(userToStore));
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
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
    const adminAuth = getAdminAuth();
    setUser(adminAuth);
    setLoaded(true);
  };

  useEffect(() => {
    // Load admin session on mount
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
    if (loaded && !isAuthenticated && typeof window !== 'undefined') {
      // Check if we're on login page to avoid redirect loop
      const currentPath = window.location.pathname;
      if (currentPath !== '/admin') {
        window.location.replace('/admin');
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
