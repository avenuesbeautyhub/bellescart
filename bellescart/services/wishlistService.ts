import { apiGet, apiPost, apiDelete } from './apiInterceptor';

export interface WishlistResponse {
  success: boolean;
  data?: {
    wishlist: any[];
  };
  message?: string;
}

export interface WishlistItemResponse {
  success: boolean;
  message?: string;
}

export const wishlistService = {
  // Get user's wishlist
  getWishlist: async (): Promise<WishlistResponse> => {
    try {
      const response = await apiGet('/auth/wishlist');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add product to wishlist
  addToWishlist: async (productId: string): Promise<WishlistItemResponse> => {
    try {
      const response = await apiPost('/auth/wishlist', { productId });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string): Promise<WishlistItemResponse> => {
    try {
      const response = await apiDelete(`/auth/wishlist/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
};
