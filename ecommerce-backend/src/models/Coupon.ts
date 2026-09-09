import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  category?: string; // For category-specific coupons
  minOrderValue: number;
  maxDiscount?: number; // Maximum discount for percentage coupons
  usageLimit: number; // Total number of times coupon can be used
  usageLimitPerUser: number; // Times a single user can use the coupon
  usedCount: number; // How many times it has been used
  validFrom: Date;
  validUntil: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  category: {
    type: String,
    trim: true
  },
  minOrderValue: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Minimum order value cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  usageLimit: {
    type: Number,
    required: true,
    default: 0, // 0 means unlimited
    min: [0, 'Usage limit cannot be negative']
  },
  usageLimitPerUser: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Usage limit per user must be at least 1']
  },
  usedCount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
couponSchema.index({ active: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ category: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);