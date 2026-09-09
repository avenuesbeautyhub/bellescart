import { ICouponInteractor } from '../providers/interfaces/ICouponInteractor';
import { ICouponRepository } from '../providers/interfaces/ICouponRepository';
import { ICoupon } from '../models/Coupon';

export class CouponInteractor implements ICouponInteractor {
  private _couponRepository: ICouponRepository;

  constructor(couponRepository: ICouponRepository) {
    this._couponRepository = couponRepository;
  }

  async createCoupon(data: Partial<ICoupon>): Promise<ICoupon> {
    // Validate required fields
    if (!data.code || !data.name || !data.discountType || data.discountValue === undefined) {
      throw new Error('Missing required fields: code, name, discountType, discountValue');
    }

    // Normalize coupon code to uppercase
    data.code = data.code.toUpperCase().trim();

    // Validate discount value based on type
    if (data.discountType === 'percentage' && (data.discountValue < 0 || data.discountValue > 100)) {
      throw new Error('Percentage discount must be between 0 and 100');
    }

    if (data.discountType === 'fixed' && data.discountValue < 0) {
      throw new Error('Fixed discount cannot be negative');
    }

    // Set default values
    if (data.usageLimit === undefined) data.usageLimit = 0;
    if (data.usageLimitPerUser === undefined) data.usageLimitPerUser = 1;
    if (data.minOrderValue === undefined) data.minOrderValue = 0;
    if (data.active === undefined) data.active = true;

    // Convert date strings to Date objects
    if (data.validFrom && typeof data.validFrom === 'string') {
      data.validFrom = new Date(data.validFrom);
    }
    if (data.validUntil && typeof data.validUntil === 'string') {
      data.validUntil = new Date(data.validUntil);
    }

    // Validate dates
    if (data.validFrom && data.validUntil && new Date(data.validFrom) >= new Date(data.validUntil)) {
      throw new Error('Valid from date must be before valid until date');
    }

    // Check if coupon code already exists
    const existingCoupon = await this._couponRepository.findByCode(data.code);
    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    return await this._couponRepository.create(data);
  }

  async getAllCoupons(): Promise<ICoupon[]> {
    return await this._couponRepository.findAll({ sort: { createdAt: -1 } });
  }

  async getCouponById(id: string): Promise<ICoupon | null> {
    return await this._couponRepository.findById(id);
  }

  async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    // Normalize coupon code to uppercase if provided
    if (data.code) {
      data.code = data.code.toUpperCase().trim();
    }

    // Validate discount value if provided
    if (data.discountType === 'percentage' && data.discountValue !== undefined) {
      if (data.discountValue < 0 || data.discountValue > 100) {
        throw new Error('Percentage discount must be between 0 and 100');
      }
    }

    if (data.discountType === 'fixed' && data.discountValue !== undefined && data.discountValue < 0) {
      throw new Error('Fixed discount cannot be negative');
    }

    // Convert date strings to Date objects if provided
    if (data.validFrom && typeof data.validFrom === 'string') {
      data.validFrom = new Date(data.validFrom);
    }
    if (data.validUntil && typeof data.validUntil === 'string') {
      data.validUntil = new Date(data.validUntil);
    }

    // Validate dates if provided
    if (data.validFrom && data.validUntil && new Date(data.validFrom) >= new Date(data.validUntil)) {
      throw new Error('Valid from date must be before valid until date');
    }

    // Check if code is being changed and if it already exists
    if (data.code) {
      const existingCoupon = await this._couponRepository.findByCode(data.code);
      if (existingCoupon && existingCoupon._id.toString() !== id) {
        throw new Error('Coupon code already exists');
      }
    }

    return await this._couponRepository.update(id, data);
  }

  async deleteCoupon(id: string): Promise<ICoupon | null> {
    return await this._couponRepository.delete(id);
  }

  async validateCoupon(code: string, userId?: string, cartTotal?: number, cartCategory?: string): Promise<{
    valid: boolean;
    coupon?: ICoupon;
    discountAmount?: number;
    error?: string;
  }> {
    const coupon = await this._couponRepository.findValidCoupon(code);
    
    if (!coupon) {
      return { valid: false, error: 'Invalid or expired coupon code' };
    }

    // Check if coupon is active
    if (!coupon.active) {
      return { valid: false, error: 'Coupon is not active' };
    }

    // Check minimum order value
    if (cartTotal !== undefined && cartTotal < coupon.minOrderValue) {
      return { 
        valid: false, 
        error: `Minimum order value of ₹${coupon.minOrderValue} required` 
      };
    }

    // Check category restriction
    if (coupon.category && cartCategory && coupon.category !== cartCategory) {
      return { 
        valid: false, 
        error: `Coupon is only valid for ${coupon.category} category` 
      };
    }

    // Check usage limit
    const canUse = await this._couponRepository.checkUsageLimit(coupon._id.toString());
    if (!canUse) {
      return { valid: false, error: 'Coupon usage limit has been reached' };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (cartTotal !== undefined) {
      if (coupon.discountType === 'percentage') {
        discountAmount = cartTotal * (coupon.discountValue / 100);
        // Apply max discount if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'free_shipping') {
        // This would typically be handled by shipping calculation
        discountAmount = 0; // Placeholder
      }
    }

    return { 
      valid: true, 
      coupon, 
      discountAmount 
    };
  }

  async applyCoupon(code: string, userId: string, cartTotal: number, cartCategory?: string): Promise<{
    success: boolean;
    coupon?: ICoupon;
    discountAmount: number;
    error?: string;
  }> {
    const validation = await this.validateCoupon(code, userId, cartTotal, cartCategory);
    
    if (!validation.valid) {
      return { 
        success: false, 
        discountAmount: 0, 
        error: validation.error 
      };
    }

    // Increment usage count
    await this._couponRepository.incrementUsage(validation.coupon!._id.toString());

    return {
      success: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount || 0
    };
  }
}