import Razorpay from 'razorpay';
import { Payment, IPayment } from '../models/Payment';
import { createLogger } from '../utils/logger';

const logger = createLogger('PaymentService');

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
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'wallet';
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

      // Note: Payment record will be created after successful payment verification
      // Razorpay payments are immediate - no pending status needed

      return {
        success: true,
        orderId: order.id,
        razorpayOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error: any) {
      logger.error('Error creating Razorpay order', { error: error.message });
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
      logger.error('Error confirming payment', { error: error.message });
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
      logger.error('Error fetching payment order', { error: error.message });
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
        // Create payment record with completed status after successful verification
        // Razorpay payments are immediate - no pending status
        await this.createPaymentRecord({
          bookingId: orderId,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          amount: 0, // Will be updated from order details
          currency: 'INR',
          status: 'completed',
          paymentMethod: 'razorpay',
          userId: '', // Will be populated from order
          paymentSignature: signature,
          metadata: { verifiedAt: new Date().toISOString() }
        });
        return {
          success: true,
          orderId,
        };
      } else {
        // Create payment record with failed status
        await this.createPaymentRecord({
          bookingId: orderId,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          amount: 0,
          currency: 'INR',
          status: 'failed',
          paymentMethod: 'razorpay',
          userId: '',
          metadata: { verificationFailed: true, failedAt: new Date().toISOString() }
        });
        return {
          success: false,
          error: 'Invalid payment signature',
        };
      }
    } catch (error: any) {
      logger.error('Error verifying payment signature', { error: error.message });
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

      logger.info('Refund processed successfully', { refundId: refund.id });

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
        logger.info('Payment record updated with refund', { paymentId: payment._id });
      }

      return {
        success: true,
        orderId: refund.id,
      };
    } catch (error: any) {
      logger.error('Error processing refund', { error: error.message });
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

      logger.info('Payment record created', { paymentId: payment._id });

      return {
        success: true,
        payment
      };
    } catch (error: any) {
      logger.error('Error creating payment record', { error: error.message });
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

      logger.info('Payment status updated', { paymentId: payment._id, status });

      return {
        success: true,
        payment
      };
    } catch (error: any) {
      logger.error('Error updating payment status', { error: error.message });
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
      logger.error('Error fetching payment by booking ID', { error: error.message });
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
      logger.error('Error fetching payment by Razorpay payment ID', { error: error.message });
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
      logger.error('Error fetching user payment history', { error: error.message });
      return {
        success: false,
        error: error.message || 'Failed to fetch payment history'
      };
    }
  }
}

export const paymentService = new PaymentService();
