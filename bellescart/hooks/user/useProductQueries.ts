import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, ProductResponse, ProductCategory } from '@/services/productService';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: any) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: ['categories'] as const,
  featured: (limit?: number) => [...productKeys.all, 'featured', limit] as const,
  byCategory: (category: string, limit?: number) => [...productKeys.all, 'category', category, limit] as const,
  search: (query: string, limit?: number) => [...productKeys.all, 'search', query, limit] as const,
  backendSearch: (query: string, params?: any) => [...productKeys.all, 'backend-search', query, params] as const,
};

// Queries
export const useProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  sort?: string;
  order?: string;
}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useFeaturedProducts = (limit?: number) => {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useProductsByCategory = (category: string, limit?: number) => {
  return useQuery({
    queryKey: productKeys.byCategory(category, limit),
    queryFn: () => productService.getProductsByCategory(category, limit),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchProducts = (query: string, limit?: number) => {
  return useQuery({
    queryKey: productKeys.search(query, limit),
    queryFn: () => productService.searchProducts(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Backend search with better params support
export const useBackendSearch = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
}) => {
  return useQuery({
    queryKey: productKeys.backendSearch(params?.search || '', params),
    queryFn: () => productService.getProducts(params),
    enabled: !!(params?.search && params.search.length > 0),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Mutations (if needed for product operations)
export const useProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // This would be used for create/update/delete operations
      // For now, just a placeholder
      return {} as ProductResponse;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
