'use client';

import { AdminLoginResponse, LoginData, LoginResponse } from '@/types/auth';
import { appConfig } from '@/config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

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
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Full URL:', `${API_BASE_URL}/admin/login`);
        console.log('Login data:', data);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

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
            const response = await fetch(`${API_BASE_URL}/admin/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

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