'use client';

import { adminApi } from './apiInterceptor';
import { PrivacyRequest } from '@/services/privacyService';

export interface PrivacyRequestsResponse {
  success: boolean;
  data?: PrivacyRequest[];
  count?: number;
  error?: string;
}

export interface PrivacyStatsResponse {
  success: boolean;
  data?: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  error?: string;
}

class AdminPrivacyService {
  async getPrivacyRequests(params?: {
    limit?: number;
    skip?: number;
    status?: string;
    type?: string;
  }): Promise<PrivacyRequestsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);

      const response = await adminApi.get(`/admin/privacy/requests?${queryParams.toString()}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get privacy requests error:', error);
      throw error;
    }
  }

  async getPrivacyRequestById(requestId: string): Promise<{ success: boolean; data?: PrivacyRequest; error?: string }> {
    try {
      const response = await adminApi.get(`/admin/privacy/requests/${requestId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get privacy request error:', error);
      throw error;
    }
  }

  async getPrivacyStats(): Promise<PrivacyStatsResponse> {
    try {
      const response = await adminApi.get('/admin/privacy/stats');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get privacy stats error:', error);
      throw error;
    }
  }
}

export const adminPrivacyService = new AdminPrivacyService();
