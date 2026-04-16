'use client';

import { adminApi } from './apiInterceptor';

export interface CreateProductData {
  name: string;
  description?: string;
  price: string;
  category: string;
  brand?: string;
  quantity: string;
  tags?: string;
  status: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  images?: File[];
  imageAlts?: string[];
  mainImageIndex?: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: any;
}

class AdminProductService {
  async createProduct(formData: FormData): Promise<ProductResponse> {
    try {
      const response = await adminApi.postFormData('/admin/products', formData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  async updateProduct(id: string, formData: FormData): Promise<ProductResponse> {
    try {
      const response = await adminApi.putFormData(`/admin/products/${id}`, formData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<ProductResponse> {
    try {
      const response = await adminApi.delete(`/admin/products/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
  }): Promise<ProductResponse> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const url = queryString ? `/admin/products?${queryString}` : '/admin/products';

      const response = await adminApi.get(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductResponse> {
    try {
      console.log('Service: Getting product with ID:', id); // Debug log
      if (!id) {
        throw new Error('Product ID is required');
      }
      const response = await adminApi.get(`/admin/products/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }
}

export const adminProductService = new AdminProductService();
