'use client';

import { apiPost } from './apiInterceptor';

export interface CouponValidationRequest {
  cartTotal?: number;
  cartCategory?: string;
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

class CouponService {
  async validateCoupon(code: string, requestData: CouponValidationRequest): Promise<CouponValidationResponse> {
    try {
      const response = await apiPost(`/user/coupons/validate/${code}`, requestData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Validate coupon error:', error);
      throw error;
    }
  }

  async applyCoupon(code: string, requestData: CouponApplyRequest): Promise<CouponApplyResponse> {
    try {
      const response = await apiPost(`/user/coupons/apply/${code}`, requestData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Apply coupon error:', error);
      throw error;
    }
  }
}

export const couponService = new CouponService();