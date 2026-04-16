'use client';

import { useState } from 'react';
import { adminProductService, CreateProductData, ProductResponse } from '@/services/admin/productService';
import { globalToast } from '@/utils/globalToast';

export const useAdminProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (formData: FormData): Promise<ProductResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminProductService.createProduct(formData);
      
      if (response.success) {
        globalToast.admin.success('Product Created', 'Product has been created successfully');
      } else {
        globalToast.admin.error('Creation Failed', response.message || 'Failed to create product');
        setError(response.message || 'Failed to create product');
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      globalToast.admin.error('Network Error', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, formData: FormData): Promise<ProductResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminProductService.updateProduct(id, formData);
      
      if (response.success) {
        globalToast.admin.success('Product Updated', 'Product has been updated successfully');
      } else {
        globalToast.admin.error('Update Failed', response.message || 'Failed to update product');
        setError(response.message || 'Failed to update product');
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      globalToast.admin.error('Network Error', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string, productName?: string): Promise<ProductResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminProductService.deleteProduct(id);
      
      if (response.success) {
        globalToast.admin.success('Product Deleted', `Product${productName ? ` "${productName}"` : ''} has been deleted`);
      } else {
        globalToast.admin.error('Deletion Failed', response.message || 'Failed to delete product');
        setError(response.message || 'Failed to delete product');
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      globalToast.admin.error('Network Error', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ProductResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminProductService.getProducts(params);
      
      if (!response.success) {
        globalToast.admin.error('Load Failed', response.message || 'Failed to load products');
        setError(response.message || 'Failed to load products');
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      globalToast.admin.error('Network Error', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id: string): Promise<ProductResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminProductService.getProductById(id);
      
      if (!response.success) {
        globalToast.admin.error('Load Failed', response.message || 'Failed to load product');
        setError(response.message || 'Failed to load product');
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      globalToast.admin.error('Network Error', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    loading,
    error,
    clearError: () => setError(null)
  };
};
