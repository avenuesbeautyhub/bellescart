import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';
import { CartItem } from '@/utils/types';

export interface CartResponse {
  success: boolean;
  data?: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  message?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export const cartService = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiGet('/cart');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (request: AddToCartRequest): Promise<CartResponse> => {
    try {
      const response = await apiPost('/cart/add', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, request: UpdateCartRequest): Promise<CartResponse> => {
    try {
      const response = await apiPut(`/cart/item/${itemId}`, request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<CartResponse> => {
    try {
      const response = await apiDelete(`/cart/item/${itemId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiDelete('/cart/clear');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};