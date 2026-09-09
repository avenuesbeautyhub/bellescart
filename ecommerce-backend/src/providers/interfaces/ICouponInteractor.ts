import { ICoupon } from '../../models/Coupon';

export interface ICouponInteractor {
  createCoupon(data: Partial<ICoupon>): Promise<ICoupon>;
  getAllCoupons(): Promise<ICoupon[]>;
  getCouponById(id: string): Promise<ICoupon | null>;
  updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon | null>;
  deleteCoupon(id: string): Promise<ICoupon | null>;
  validateCoupon(code: string, userId?: string, cartTotal?: number, cartCategory?: string): Promise<{
    valid: boolean;
    coupon?: ICoupon;
    discountAmount?: number;
    error?: string;
  }>;
  applyCoupon(code: string, userId: string, cartTotal: number, cartCategory?: string): Promise<{
    success: boolean;
    coupon?: ICoupon;
    discountAmount: number;
    error?: string;
  }>;
}