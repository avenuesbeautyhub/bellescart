import Razorpay from 'razorpay';
import { Payment, IPayment } from '../models/Payment';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  userId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  success: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

export interface CreatePaymentRecordRequest {
  bookingId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'cash_on_delivery' | 'credit_card' | 'debit_card';
  userId: string;
  orderId?: string;
  paymentSignature?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRecordResponse {
  success: boolean;
  payment?: IPayment;
  error?: string;
}

export class PaymentService {
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      const { amount, currency = 'INR', orderId, userId, metadata = {} } = request;

      // Create Razorpay order
      const options: any = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency.toUpperCase(),
        receipt: orderId || '',
        notes: {
          orderId: orderId || '',
          userId: userId || '',
          ...metadata,
        },
      };

      const order = await razorpay.orders.create(options);

      // Create payment record in database
      if (userId && orderId) {
        await this.createPaymentRecord({
          bookingId: orderId,
          razorpayOrderId: order.id,
          amount: Number(order.amount) / 100, // Convert back to rupees
          currency: order.currency,
          status: 'pending',
          paymentMethod: 'razorpay',
          userId,
          orderId,
          metadata: { ...metadata, razorpayOrderId: order.id }
        });
      }

      return {
        success: true,
        orderId: order.id,
        razorpayOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment order',
      };
    }
  }

  async confirmPayment(razorpayOrderId: string): Promise<PaymentIntentResponse> {
    try {
      const order = await razorpay.orders.fetch(razorpayOrderId);

      if (order.status === 'paid') {
        return {
          success: true,
          orderId: order.id,
          razorpayOrderId: order.id,
        };
      } else {
        return {
          success: false,
          error: `Payment not successful. Status: ${order.status}`,
        };
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm payment',
      };
    }
  }

  async cancelPaymentIntent(razorpayOrderId: string): Promise<PaymentIntentResponse> {
    try {
      // Razorpay doesn't have a direct cancel method for orders
      // Orders expire automatically after a period
      // We can fetch the order to check its status
      const order = await razorpay.orders.fetch(razorpayOrderId);

      return {
        success: true,
        orderId: order.id,
        razorpayOrderId: order.id,
      };
    } catch (error: any) {
      console.error('Error fetching payment order:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment order',
      };
    }
  }

  async verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<PaymentIntentResponse> {
    try {
      const crypto = require('crypto');
      const secret = process.env.RAZORPAY_KEY_SECRET || '';

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature === signature) {
        // Update payment record with completed status and signature
        await this.updatePaymentStatus(paymentId, 'completed', signature);
        return {
          success: true,
          orderId,
        };
      } else {
        // Update payment record with failed status
        await this.updatePaymentStatus(paymentId, 'failed');
        return {
          success: false,
          error: 'Invalid payment signature',
        };
      }
    } catch (error: any) {
      console.error('Error verifying payment signature:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment signature',
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentIntentResponse> {
    try {
      const refundData: any = {
        payment_id: paymentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Razorpay expects amount in paise
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);

      console.log('💰 Refund processed successfully:', refund.id);

      // Update payment record with refund information if exists
      const payment = await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        {
          status: 'refunded',
          refundId: refund.id,
          refundAmount: amount ? amount : undefined
        },
        { new: true }
      );

      if (payment) {
        console.log('💳 Payment record updated with refund:', payment._id);
      }

      return {
        success: true,
        orderId: refund.id,
      };
    } catch (error: any) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error.message || 'Failed to process refund',
      };
    }
  }

  async createPaymentRecord(request: CreatePaymentRecordRequest): Promise<PaymentRecordResponse> {
    try {
      const payment = new Payment({
        bookingId: request.bookingId,
        razorpayPaymentId: request.razorpayPaymentId,
        razorpayOrderId: request.razorpayOrderId,
        amount: request.amount,
        currency: request.currency,
        status: request.status,
        paymentMethod: request.paymentMethod,
        user: request.userId,
        order: request.orderId,
        paymentSignature: request.paymentSignature,
        metadata: request.metadata
      });

      await payment.save();

      console.log('💳 Payment record created:', payment._id);

      return {
        success: true,
        payment
      };
    } catch (error: any) {
      console.error('Error creating payment record:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment record'
      };
    }
  }

  async updatePaymentStatus(razorpayPaymentId: string, status: 'completed' | 'failed', paymentSignature?: string): Promise<PaymentRecordResponse> {
    try {
      const updateData: any = { status };
      if (paymentSignature) {
        updateData.paymentSignature = paymentSignature;
      }

      const payment = await Payment.findOneAndUpdate(
        { razorpayPaymentId },
        updateData,
        { new: true }
      );

      if (!payment) {
        return {
          success: false,
          error: 'Payment record not found'
        };
      }

      console.log('💳 Payment status updated:', payment._id, status);

      return {
        success: true,
        payment
      };
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update payment status'
      };
    }
  }

  async getPaymentByBookingId(bookingId: string): Promise<PaymentRecordResponse> {
    try {
      const payment = await Payment.findOne({ bookingId }).populate('user').populate('order');

      if (!payment) {
        return {
          success: false,
          error: 'Payment record not found'
        };
      }

      return {
        success: true,
        payment
      };
    } catch (error: any) {
      console.error('Error fetching payment by booking ID:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment record'
      };
    }
  }

  async getPaymentByRazorpayPaymentId(razorpayPaymentId: string): Promise<PaymentRecordResponse> {
    try {
      const payment = await Payment.findOne({ razorpayPaymentId }).populate('user').populate('order');

      if (!payment) {
        return {
          success: false,
          error: 'Payment record not found'
        };
      }

      return {
        success: true,
        payment
      };
    } catch (error: any) {
      console.error('Error fetching payment by Razorpay payment ID:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment record'
      };
    }
  }

  async getUserPaymentHistory(userId: string, options: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
  } = {}): Promise<{ success: boolean; payments?: IPayment[]; error?: string; pagination?: any }> {
    try {
      const { page = 1, limit = 10, status } = options;
      const query: any = { user: userId };
      if (status) {
        query.status = status;
      }

      const payments = await Payment.find(query)
        .populate('order')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Payment.countDocuments(query);

      return {
        success: true,
        payments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      };
    } catch (error: any) {
      console.error('Error fetching user payment history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch payment history'
      };
    }
  }
}

export const paymentService = new PaymentService();
