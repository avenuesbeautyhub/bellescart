'use client';

import { appConfig } from '@/config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

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
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  async updateProduct(id: string, formData: FormData): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
      });

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
  }): Promise<ProductResponse> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const url = queryString ? `${API_BASE_URL}/products?${queryString}` : `${API_BASE_URL}/products`;
      
      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }
}

export const adminProductService = new AdminProductService();
