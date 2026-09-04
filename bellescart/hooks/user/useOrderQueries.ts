import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, OrderResponse, OrdersResponse, CreateOrderRequest } from '@/services/orderService';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: any) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  tracking: (awb: string) => [...orderKeys.all, 'tracking', awb] as const,
  trackingById: (id: string) => [...orderKeys.all, 'tracking', id] as const,
};

// Queries
export const useOrders = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.getOrders(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTrackOrder = (awb: string) => {
  return useQuery({
    queryKey: orderKeys.tracking(awb),
    queryFn: () => orderService.trackOrder(awb),
    enabled: !!awb,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useTrackOrderById = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.trackingById(orderId),
    queryFn: () => orderService.trackOrderByOrderId(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

// Mutations
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrderRequest) => orderService.createOrder(request),
    onSuccess: () => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};

export const useCalculateShipping = () => {
  return useMutation({
    mutationFn: (request: { delivery_postcode: string; cod?: number }) => 
      orderService.calculateShipping(request),
  });
};

export const useProcessNimbusOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { orderId: string; orderData: any; courierId: string }) => 
      orderService.processNimbusOrder(request),
    onSuccess: () => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};
