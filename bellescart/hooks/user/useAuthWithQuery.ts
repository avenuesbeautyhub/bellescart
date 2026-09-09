'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from './useAuthQuery';
import { getUserToken, getUserRefreshToken } from '@/auth/user';
import { User } from '@/utils/types';

const getCachedUserData = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('bellescart_user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse cached user data:', error);
    return null;
  }
};

export function useAuthWithQuery() {
  const [loaded, setLoaded] = useState(false);
  const { data: user, isLoading, error } = useCurrentUser();
  
  const token = getUserToken();
  const refreshToken = getUserRefreshToken();
  const isAuthenticated = !!token || !!refreshToken;

  useEffect(() => {
    // Load cached user data immediately for instant display
    const cachedUser = getCachedUserData();
    if (cachedUser && !user) {
      // We'll use the cached data initially, React Query will update it
    }
    
    // Set loaded to true immediately if tokens exist
    if (token || refreshToken) {
      setLoaded(true);
    } else {
      setLoaded(true);
    }
  }, [token, refreshToken, user]);

  return {
    user: user as User | null,
    loaded,
    isAuthenticated,
    isLoading,
    isAdmin: !!user && user.role === 'admin',
  };
}