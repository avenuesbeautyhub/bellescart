'use client';

import { adminApi } from './apiInterceptor';

export interface OrderData {
  _id: string;
  id: string;
  userId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  coupon?: {
    _id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
  discountAmount?: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: {
    orders?: OrderData[];
    order?: OrderData;
    total?: number;
    page?: number;
    limit?: number;
  };
}

class AdminOrderService {
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<OrderResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      console.log('Fetching admin orders:', queryParams.toString());

      // Using the admin orders endpoint to get ALL orders
      const response = await adminApi.get(`/admin/orders?${queryParams.toString()}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await adminApi.get(`/admin/orders/${orderId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderResponse> {
    try {
      const response = await adminApi.put(`/admin/orders/${orderId}/status`, { status });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<OrderResponse> {
    try {
      const response = await adminApi.put(`/admin/orders/${orderId}/cancel`, {});
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  async getOrdersByUser(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<OrderResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await adminApi.get(`/admin/users/${userId}/orders?${queryParams.toString()}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  }
}

export const adminOrderService = new AdminOrderService();
