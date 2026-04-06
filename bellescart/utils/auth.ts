'use client';

import { useEffect, useState } from 'react';
import { User } from './types';

const AUTH_USER_KEY = 'bellescart_user';
const AUTH_TOKEN_KEY = 'bellescart_token';

export const getAuthUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = window.localStorage.getItem(AUTH_USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAuthUser() && !!getAuthToken();
};

export const isAdminUser = (): boolean => {
  const user = getAuthUser();
  return !!user && user.role === 'admin';
};

export const saveAuthSession = (user: User, token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getAuthUser());
    setLoaded(true);
  }, []);

  return {
    user,
    loaded,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
  };
};

export const useRequireAuth = () => {
  const { user, isAuthenticated, loaded } = useAuth();

  useEffect(() => {
    if (loaded && !isAuthenticated) {
      // Redirect to login page if not authenticated
      window.location.href = '/login';
    }
  }, [isAuthenticated, loaded]);

  return { user, isAuthenticated, loaded };
};
