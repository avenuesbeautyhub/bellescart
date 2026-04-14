import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
  addedAt: Date;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      name: String,
      option: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: [0, 'Shipping cannot be negative'],
    default: 0
  },
  discount: {
    type: Number,
    required: true,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
    default: 0
  },
  couponCode: String,
  couponDiscount: {
    type: Number,
    min: [0, 'Coupon discount cannot be negative'],
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    expires: 43200 // TTL in seconds (30 days)
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount - (this.couponDiscount || 0);

  // Update expiration time
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  next();
});

// Indexes are automatically created by unique: true and expires: options

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
