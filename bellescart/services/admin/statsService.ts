'use client';

import { adminApi } from './apiInterceptor';

export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
  todayOrders?: number;
  todayRevenue?: number;
  thisMonthOrders?: number;
  thisMonthRevenue?: number;
  averageOrderValue?: number;
  lowStockProducts?: number;
  outOfStockProducts?: number;
}

export interface StatsResponse {
  success: boolean;
  data?: {
    stats: AdminStatsData;
  };
}

class AdminStatsService {
  async getAdminStats(): Promise<StatsResponse> {
    try {
      const response = await adminApi.get('/admin/stats');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get admin stats error:', error);
      throw error;
    }
  }
}

export const adminStatsService = new AdminStatsService();