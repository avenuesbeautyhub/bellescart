'use client';

import { adminApi } from './apiInterceptor';

export interface CouponData {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  category?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil: string;
  active?: boolean;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data?: {
    coupons?: any[];
    coupon?: any;
  };
}

export interface CouponValidation {
  valid: boolean;
  coupon?: any;
  discountAmount?: number;
  error?: string;
}

class AdminCouponService {
  async getAllCoupons(): Promise<CouponResponse> {
    try {
      const response = await adminApi.get('/admin/coupons');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get coupons error:', error);
      throw error;
    }
  }

  async createCoupon(couponData: CouponData): Promise<CouponResponse> {
    try {
      // Normalize coupon code to uppercase
      const normalizedData = {
        ...couponData,
        code: couponData.code.toUpperCase().trim()
      };
      const response = await adminApi.post('/admin/coupons', normalizedData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create coupon error:', error);
      throw error;
    }
  }

  async getCouponById(id: string): Promise<CouponResponse> {
    try {
      const response = await adminApi.get(`/admin/coupons/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get coupon error:', error);
      throw error;
    }
  }

  async updateCoupon(id: string, couponData: Partial<CouponData>): Promise<CouponResponse> {
    try {
      const response = await adminApi.put(`/admin/coupons/${id}`, couponData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update coupon error:', error);
      throw error;
    }
  }

  async deleteCoupon(id: string): Promise<CouponResponse> {
    try {
      const response = await adminApi.delete(`/admin/coupons/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete coupon error:', error);
      throw error;
    }
  }
}

export const adminCouponService = new AdminCouponService();