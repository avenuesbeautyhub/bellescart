import { ICoupon } from '../../models/Coupon';

export interface ICouponRepository {
  create(data: Partial<ICoupon>): Promise<ICoupon>;
  findById(id: string): Promise<ICoupon | null>;
  findAll(options?: { limit?: number; skip?: number; sort?: any }): Promise<ICoupon[]>;
  update(id: string, data: Partial<ICoupon>): Promise<ICoupon | null>;
  delete(id: string): Promise<ICoupon | null>;
  findByCode(code: string): Promise<ICoupon | null>;
  findActiveCoupons(): Promise<ICoupon[]>;
  findValidCoupon(code: string): Promise<ICoupon | null>;
  incrementUsage(couponId: string): Promise<ICoupon | null>;
  findByCategory(category: string): Promise<ICoupon[]>;
  checkUsageLimit(couponId: string): Promise<boolean>;
}