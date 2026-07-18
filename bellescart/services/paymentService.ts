import { apiPost, apiPut } from './apiInterceptor';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  data?: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
  error?: string;
}

export const paymentService = {
  // Create payment order
  createPaymentIntent: async (request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiPost('/payment/create-intent', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (razorpayOrderId: string): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiPost(`/payment/confirm/${razorpayOrderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  // Cancel payment order
  cancelPayment: async (razorpayOrderId: string): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiPost(`/payment/cancel/${razorpayOrderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  },

  // Verify payment signature
  verifyPayment: async (orderId: string, paymentId: string, signature: string): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiPost('/payment/verify', { orderId, paymentId, signature });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
};
