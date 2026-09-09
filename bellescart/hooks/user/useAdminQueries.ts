import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductService, ProductResponse, CreateProductData } from '@/services/admin/productService';
import { adminOrderService, OrderResponse, OrderData } from '@/services/admin/orderService';
import { adminCategoryService, CategoryResponse, CategoryData } from '@/services/admin/categoryService';
import { adminUserService, UserResponse, UserData } from '@/services/admin/userService';
import { adminCouponService, CouponResponse, CouponData } from '@/services/admin/couponService';

// ===== ADMIN PRODUCT QUERIES =====
export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (params?: any) => [...adminProductKeys.lists(), params] as const,
  details: () => [...adminProductKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminProductKeys.details(), id] as const,
};

export const useAdminProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  sort?: string;
  order?: string;
}) => {
  return useQuery({
    queryKey: adminProductKeys.list(params),
    queryFn: () => adminProductService.getProducts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAdminProduct = (id: string) => {
  return useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => adminProductService.getProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => adminProductService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => 
      adminProductService.updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
  });
};

// ===== ADMIN ORDER QUERIES =====
export const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  lists: () => [...adminOrderKeys.all, 'list'] as const,
  list: (params?: any) => [...adminOrderKeys.lists(), params] as const,
  details: () => [...adminOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminOrderKeys.details(), id] as const,
  userOrders: (userId: string) => [...adminOrderKeys.all, 'user', userId] as const,
};

export const useAdminOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: () => adminOrderService.getAllOrders(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAdminOrder = (orderId: string) => {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: () => adminOrderService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminOrdersByUser = (userId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: [...adminOrderKeys.userOrders(userId), params],
    queryFn: () => adminOrderService.getOrdersByUser(userId, params),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      adminOrderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
    },
  });
};

export const useAdminCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => adminOrderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
    },
  });
};

// ===== ADMIN CATEGORY QUERIES =====
export const adminCategoryKeys = {
  all: ['admin', 'categories'] as const,
  lists: () => [...adminCategoryKeys.all, 'list'] as const,
  details: () => [...adminCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCategoryKeys.details(), id] as const,
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: adminCategoryKeys.lists(),
    queryFn: () => adminCategoryService.getAllCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useAdminCategory = (id: string) => {
  return useQuery({
    queryKey: adminCategoryKeys.detail(id),
    queryFn: () => adminCategoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CategoryData) => adminCategoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, categoryData }: { id: string; categoryData: CategoryData }) => 
      adminCategoryService.updateCategory(id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all });
    },
  });
};

// ===== ADMIN USER QUERIES =====
export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params?: any) => [...adminUserKeys.lists(), params] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
};

export const useAdminUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => adminUserService.getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => adminUserService.getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<UserData> }) => 
      adminUserService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'suspended' }) => 
      adminUserService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};

// ===== ADMIN COUPON QUERIES =====
export const adminCouponKeys = {
  all: ['admin', 'coupons'] as const,
  lists: () => [...adminCouponKeys.all, 'list'] as const,
  details: () => [...adminCouponKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCouponKeys.details(), id] as const,
};

export const useAdminCoupons = () => {
  return useQuery({
    queryKey: adminCouponKeys.lists(),
    queryFn: () => adminCouponService.getAllCoupons(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminCoupon = (id: string) => {
  return useQuery({
    queryKey: adminCouponKeys.detail(id),
    queryFn: () => adminCouponService.getCouponById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponData: CouponData) => adminCouponService.createCoupon(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.all });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, couponData }: { id: string; couponData: Partial<CouponData> }) => 
      adminCouponService.updateCoupon(id, couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.all });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCouponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.all });
    },
  });
};
