'use client';

import { apiPost, apiGet } from './apiInterceptor';

export interface CouponValidationRequest {
  cartTotal?: number;
  cartCategory?: string;
  cartCategories?: string[];
}

export interface CouponValidationResponse {
  success: boolean;
  message: string;
  data?: {
    valid: boolean;
    coupon?: any;
    discountAmount?: number;
    error?: string;
  };
}

export interface CouponApplyRequest {
  cartTotal: number;
  cartCategory?: string;
  cartCategories?: string[];
}

export interface CouponApplyResponse {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    coupon?: any;
    discountAmount: number;
    error?: string;
  };
}

export interface ActiveCouponsResponse {
  success: boolean;
  message: string;
  data?: {
    coupons: any[];
  };
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  category?: string;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usageLimitPerUser: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

class CouponService {
  async validateCoupon(code: string, requestData: CouponValidationRequest): Promise<CouponValidationResponse> {
    try {
      const response = await apiPost(`/user/coupons/validate/${code}`, requestData);
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();
      return result;
    } catch (error) {
      console.error('Validate coupon error:', error);
      throw error;
    }
  }

  async applyCoupon(code: string, requestData: CouponApplyRequest): Promise<CouponApplyResponse> {
    try {
      const response = await apiPost(`/user/coupons/apply/${code}`, requestData);
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();
      return result;
    } catch (error) {
      console.error('Apply coupon error:', error);
      throw error;
    }
  }

  async getActiveCoupons(): Promise<ActiveCouponsResponse> {
    try {
      const response = await apiGet('/user/coupons/active');
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();
      return result;
    } catch (error) {
      console.error('Get active coupons error:', error);
      throw error;
    }
  }
}

export const couponService = new CouponService();