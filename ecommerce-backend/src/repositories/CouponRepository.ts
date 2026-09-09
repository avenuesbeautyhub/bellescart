import { Coupon, ICoupon } from '../models/Coupon';
import { BaseRepository } from './BaseRepository';

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() {
    super(Coupon);
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return this.model.findOne({ code: code.toUpperCase() });
  }

  async findActiveCoupons(): Promise<ICoupon[]> {
    const now = new Date();
    return this.model.find({
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    }).sort({ createdAt: -1 });
  }

  async findValidCoupon(code: string): Promise<ICoupon | null> {
    const now = new Date();
    return this.model.findOne({
      code: code.toUpperCase(),
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });
  }

  async incrementUsage(couponId: string): Promise<ICoupon | null> {
    return this.model.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } },
      { new: true }
    );
  }

  async findByCategory(category: string): Promise<ICoupon[]> {
    const now = new Date();
    return this.model.find({
      category,
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });
  }

  async checkUsageLimit(couponId: string): Promise<boolean> {
    const coupon = await this.model.findById(couponId);
    if (!coupon) return false;
    
    // If usageLimit is 0, it means unlimited
    if (coupon.usageLimit === 0) return true;
    
    return coupon.usedCount < coupon.usageLimit;
  }

  // Implement missing findAll method from interface
  async findAll(options?: { limit?: number; skip?: number; sort?: any }): Promise<ICoupon[]> {
    return this.model.find({}, null, options);
  }
}