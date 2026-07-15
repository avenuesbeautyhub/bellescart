import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
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

export class PaymentService {
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      const { amount, currency = 'INR', orderId, metadata = {} } = request;

      // Create Razorpay order
      const options: any = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency.toUpperCase(),
        receipt: orderId || '',
        notes: {
          orderId: orderId || '',
          ...metadata,
        },
      };

      const order = await razorpay.orders.create(options);

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
        return {
          success: true,
          orderId,
        };
      } else {
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
}

export const paymentService = new PaymentService();
