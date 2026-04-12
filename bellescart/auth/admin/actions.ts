'use client';

import { useAdminAuth } from './index';
import { UserProfile } from '@/types/auth';

export const useAdminAuthActions = () => {
  const { user, loaded, isAuthenticated } = useAdminAuth();

  const adminLogin = async (credentials: { email: string; password: string }) => {
    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.login(credentials);

      if (response.success && response.data?.user && response.data?.token) {
        const { saveAdminSession } = await import('./index');
        saveAdminSession(response.data.user, response.data.token, response.data.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const adminLogout = async () => {
    const { clearAdminSession } = await import('./index');
    clearAdminSession();
    window.location.href = '/admin/login';
  };

  return {
    user,
    loaded,
    isAuthenticated,
    adminLogin,
    adminLogout,
  };
};
