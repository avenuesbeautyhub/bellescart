'use client';

import { adminApi } from './apiInterceptor';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  joinDate: string;
  orders: number;
  phone_number: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: {
    users?: UserData[];
    user?: UserData;
  };
}

class AdminUserService {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UserResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.status) queryParams.append('status', params.status);
      console.log('making call get users', queryParams.toString());

      const response = await adminApi.get(`/admin/users?${queryParams.toString()}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserResponse> {
    try {
      const response = await adminApi.get(`/admin/users/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<UserData>): Promise<UserResponse> {
    try {
      const response = await adminApi.put(`/admin/users/${id}`, userData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<UserResponse> {
    try {
      const response = await adminApi.put(`/admin/users/${id}/status`, { status });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<UserResponse> {
    try {
      const response = await adminApi.delete(`/admin/users/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
}

export const adminUserService = new AdminUserService();
