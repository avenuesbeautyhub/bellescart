import { apiPost, apiPut, apiGet } from './apiInterceptor';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  userId?: string;
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

export interface PaymentRecord {
  _id: string;
  bookingId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'wallet';
  user: string;
  order?: string;
  paymentSignature?: string;
  metadata?: Record<string, any>;
  refundId?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data?: {
    payments: PaymentRecord[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
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
      console.error('Error canceling payment order:', error);
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

  // Get payment history
  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
  }): Promise<PaymentHistoryResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `/payment/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiGet(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Get payment by booking ID
  getPaymentByBookingId: async (bookingId: string): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> => {
    try {
      const response = await apiGet(`/payment/booking/${bookingId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment by booking ID:', error);
      throw error;
    }
  },

  // Create payment record
  createPaymentRecord: async (request: {
    bookingId: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'razorpay' | 'stripe' | 'paypal' | 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'wallet';
    userId?: string;
    orderId?: string;
    paymentSignature?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> => {
    try {
      const response = await apiPost('/payment/create-record', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  },
};