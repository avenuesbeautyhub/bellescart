import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  bookingId: string; // Order number or order ID
  razorpayPaymentId?: string; // Razorpay payment ID
  razorpayOrderId?: string; // Razorpay order ID
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'wallet';
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId; // Reference to Order
  paymentSignature?: string; // Razorpay signature for verification
  metadata?: Record<string, any>; // Additional payment information
  refundId?: string; // Razorpay refund ID if refunded
  refundAmount?: number; // Refund amount if refunded
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  bookingId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'cash_on_delivery', 'credit_card', 'debit_card'],
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  paymentSignature: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  refundId: {
    type: String,
    sparse: true
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
