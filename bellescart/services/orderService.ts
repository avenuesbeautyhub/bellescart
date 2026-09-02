import { apiGet, apiPost, apiPut } from './apiInterceptor';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'razorpay' | 'cash_on_delivery';
  notes?: string;
  paymentId?: string;
  calculatedShippingFee?: number;
  processNimbus?: boolean;
  nimbusCourierId?: string;
  nimbusAllRates?: any[];
}

export interface OrderResponse {
  success: boolean;
  data?: {
    order: any;
  };
  message?: string;
}

export interface OrdersResponse {
  success: boolean;
  data?: {
    orders: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export const orderService = {
  // Create a new order
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    try {
      const response = await apiPost('/orders', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user's orders
  getOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<OrdersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiGet(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response = await apiGet(`/orders/${orderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response = await apiPut(`/orders/${orderId}/cancel`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Calculate shipping rates
  calculateShipping: async (request: {
    delivery_postcode: string;
    cod?: number;
  }): Promise<any> => {
    try {
      const response = await apiPost('/orders/shipping/calculate', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
    try {
      const response = await apiPut(`/orders/${orderId}/status`, { status });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Process NimbusPost order
  processNimbusOrder: async (request: {
    orderId: string;
    orderData: any;
    courierId: string;
  }): Promise<any> => {
    try {
      const response = await apiPost('/orders/nimbus/process', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing NimbusPost order:', error);
      throw error;
    }
  },

  // Track order by AWB number
  trackOrder: async (awb: string): Promise<any> => {
    try {
      const response = await apiGet(`/orders/track/${awb}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  },

  // Track order by order ID
  trackOrderByOrderId: async (orderId: string): Promise<any> => {
    try {
      const response = await apiGet(`/orders/${orderId}/track`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error tracking order by ID:', error);
      throw error;
    }
  },
};