'use client';

import { apiGet, publicApiGet } from './apiInterceptor';

export interface ProductImage {
  url: string;
  alt: string;
  isMain: boolean;
  _id: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  description: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  brand?: string;
  quantity: number;
  images: ProductImage[];
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: {
    products?: Product[];
    product?: Product;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class ProductService {
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
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.order) searchParams.set('order', params.order);

      const queryString = searchParams.toString();
      const url = queryString ? `/products?${queryString}` : '/products';

      const response = await apiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async getFeaturedProducts(limit?: number): Promise<ProductResponse> {
    try {
      const url = limit ? `/products/featured?limit=${limit}` : '/products/featured';
      const response = await apiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductResponse> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }
      const response = await apiGet(`/products/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string, limit?: number): Promise<ProductResponse> {
    try {
      const url = limit ? `/products/category/${category}?limit=${limit}` : `/products/category/${category}`;
      const response = await apiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  }

  async getCategories(): Promise<{ success: boolean; data?: { categories: ProductCategory[] } }> {
    try {
      const response = await apiGet('/public/categories');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  async searchProducts(query: string, limit?: number): Promise<ProductResponse> {
    try {
      const url = limit ? `/products/search?q=${encodeURIComponent(query)}&limit=${limit}` : `/products/search?q=${encodeURIComponent(query)}`;
      const response = await apiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
