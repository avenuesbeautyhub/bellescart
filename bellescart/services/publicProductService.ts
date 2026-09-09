'use client';

import { publicApiGet } from './apiInterceptor';

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
  originalPrice?: number;
  image?: string;
  category: ProductCategory;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  images: ProductImage[];
  brand?: string;
  quantity: number;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
}

export interface PublicProductResponse {
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

class PublicProductService {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
  }): Promise<PublicProductResponse> {
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
      const url = queryString ? `/public/products?${queryString}` : '/public/products';

      const response = await publicApiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async getFeaturedProducts(limit?: number): Promise<PublicProductResponse> {
    try {
      const url = limit ? `/public/products/featured?limit=${limit}` : '/public/products/featured';
      const response = await publicApiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<PublicProductResponse> {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }
      const response = await publicApiGet(`/public/products/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string, limit?: number): Promise<PublicProductResponse> {
    try {
      const url = limit ? `/public/products/category/${category}?limit=${limit}` : `/public/products/category/${category}`;
      const response = await publicApiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  }

  async getCategories(): Promise<{ success: boolean; data?: { categories: ProductCategory[] } }> {
    try {
      const response = await publicApiGet('/public/categories');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  async searchProducts(query: string, limit?: number): Promise<PublicProductResponse> {
    try {
      const url = limit ? `/public/products/search?q=${encodeURIComponent(query)}&limit=${limit}` : `/public/products/search?q=${encodeURIComponent(query)}`;
      const response = await publicApiGet(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }
}

export const publicProductService = new PublicProductService();
