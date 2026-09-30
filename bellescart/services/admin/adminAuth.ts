'use client';

import { AdminLoginResponse, LoginData, LoginResponse } from '@/types/auth';
import { adminApi } from './apiInterceptor';

interface AdminRegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  registrationKey: string;
}

interface AdminRegisterResponse {
  success: boolean;
  message: string;
  data?: {
    admin: any;
  };
}

class AdminAuthService {
  async adminLogin(data: LoginData): Promise<AdminLoginResponse> {
        console.log('entered in the auth service');
        console.log('Login data:', data);

        try {
            const response = await adminApi.post('/admin/login', data);
            const result = await response.json();
            console.log('Response data:', result);
            return result;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

  async registerAdmin(data: AdminRegisterData): Promise<AdminRegisterResponse> {
    console.log('Registering admin:', data);

    try {
      const response = await adminApi.post('/admin/register', data);
      const result = await response.json();
      console.log('Register response:', result);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
        }
    }
}

export const adminAuthService = new AdminAuthService();
