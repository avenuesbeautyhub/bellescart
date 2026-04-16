'use client';

import { adminApi } from './apiInterceptor';

export interface CategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data?: {
    categories?: any[];
    category?: any;
  };
}

class AdminCategoryService {
  async getAllCategories(): Promise<CategoryResponse> {
    try {
      const response = await adminApi.get('/admin/categories');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  async createCategory(categoryData: CategoryData): Promise<CategoryResponse> {
    try {
      const response = await adminApi.post('/admin/categories', categoryData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  async getCategoryById(id: string): Promise<CategoryResponse> {
    try {
      const response = await adminApi.get(`/admin/categories/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: CategoryData): Promise<CategoryResponse> {
    try {
      const response = await adminApi.put(`/admin/categories/${id}`, categoryData);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<CategoryResponse> {
    try {
      const response = await adminApi.delete(`/admin/categories/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }
}

export const adminCategoryService = new AdminCategoryService();
