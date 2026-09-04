import { useQuery } from '@tanstack/react-query';
import { publicProductService } from '@/services/publicProductService';
import { Product, ProductCategory } from '@/utils/types';

// Query keys
export const publicProductKeys = {
  all: ['publicProducts'] as const,
  lists: () => [...publicProductKeys.all, 'list'] as const,
  list: (params?: any) => [...publicProductKeys.lists(), params] as const,
  details: () => [...publicProductKeys.all, 'detail'] as const,
  detail: (id: string) => [...publicProductKeys.details(), id] as const,
  categories: ['publicCategories'] as const,
  featured: (limit?: number) => [...publicProductKeys.all, 'featured', limit] as const,
  byCategory: (category: string, limit?: number) => [...publicProductKeys.all, 'category', category, limit] as const,
  search: (query: string, limit?: number) => [...publicProductKeys.all, 'search', query, limit] as const,
};

// Queries
export const usePublicProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  sort?: string;
  order?: string;
}) => {
  return useQuery({
    queryKey: publicProductKeys.list(params),
    queryFn: () => publicProductService.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePublicProduct = (id: string) => {
  return useQuery({
    queryKey: publicProductKeys.detail(id),
    queryFn: () => publicProductService.getProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const usePublicCategories = () => {
  return useQuery({
    queryKey: publicProductKeys.categories,
    queryFn: () => publicProductService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const usePublicFeaturedProducts = (limit?: number) => {
  return useQuery({
    queryKey: publicProductKeys.featured(limit),
    queryFn: () => publicProductService.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const usePublicProductsByCategory = (category: string, limit?: number) => {
  return useQuery({
    queryKey: publicProductKeys.byCategory(category, limit),
    queryFn: () => publicProductService.getProductsByCategory(category, limit),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePublicSearchProducts = (query: string, limit?: number) => {
  return useQuery({
    queryKey: publicProductKeys.search(query, limit),
    queryFn: () => publicProductService.searchProducts(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
