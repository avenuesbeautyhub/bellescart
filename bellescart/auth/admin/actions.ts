'use client';

import { adminAuthService } from '@/services/admin/adminAuth';
import { clearAdminSession, saveAdminSession, useAdminAuth } from './index';
import { globalToast } from '@/utils/globalToast';


export const useAdminAuthActions = () => {
  const { user, loaded, isAuthenticated } = useAdminAuth();

  const adminLogin = async (credentials: { email: string; password: string }) => {
    try {

      const response = await adminAuthService.adminLogin(credentials);

      if (response.success && response.data?.admin && response.data?.token) {
        console.log('Login successful, saving session...');
        console.log('User data:', response.data.admin);
        console.log('Token:', response.data.token);

        saveAdminSession(response.data.admin, response.data.token);

        console.log('Session saved, checking localStorage...');
        console.log('Admin user:', localStorage.getItem('bellescart_admin_user'));
        console.log('Admin token:', localStorage.getItem('bellescart_admin_token'));

        globalToast.admin.loginSuccess(response.data.admin.name);

        console.log('Redirecting to dashboard...');
        window.location.href = '/admin/dashboard';
      } else {
        console.log('Login failed:', response);
        globalToast.admin.loginError(response.message || 'Login failed');
      }

      return response;
    } catch (error: any) {
      console.error('Admin login error:', error);
      globalToast.admin.loginError(error.message || 'Network error occurred');
      throw error;
    }
  };

  const adminLogout = async () => {
    try {
      globalToast.admin.logoutSuccess();
      clearAdminSession();
      window.location.href = '/admin';
    } catch (error) {
      console.error('Admin logout error:', error);
      // Still clear local session even if API call fails
      clearAdminSession();
      window.location.href = '/admin';
    }
  };

  return {
    user,
    loaded,
    isAuthenticated,
    adminLogin,
    adminLogout,
  };
};
