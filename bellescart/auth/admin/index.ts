'use client';

import { useEffect, useState } from 'react';
import { User } from '@/utils/types';
import { UserProfile } from '@/types/auth';

// Admin authentication keys (separate from user auth)
const ADMIN_USER_KEY = 'bellescart_admin_user';
const ADMIN_TOKEN_KEY = 'bellescart_admin_token';
const ADMIN_REFRESH_TOKEN_KEY = 'bellescart_admin_refresh_token';

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
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const getAdminRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAdminAuth() && !!getAdminToken();
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
  if (refreshToken) {
    window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAdminSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_USER_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getAdminAuth());
    setLoaded(true);
  }, []);

  return {
    user,
    loaded,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
  };
};

export const useRequireAdminAuth = () => {
  const { user, isAuthenticated, loaded } = useAdminAuth();

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      window.location.replace('/admin/login');
    }
  }, [isAuthenticated, loaded]);

  return { user, isAuthenticated, loaded };
};
