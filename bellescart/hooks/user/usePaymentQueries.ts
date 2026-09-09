import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService, PaymentHistoryResponse } from '@/services/paymentService';

// Query keys
export const paymentKeys = {
  all: ['payments'] as const,
  history: () => [...paymentKeys.all, 'history'] as const,
  details: (id: string) => [...paymentKeys.all, 'detail', id] as const,
};

// Queries
export const usePaymentHistory = (params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
}) => {
  return useQuery({
    queryKey: [...paymentKeys.history(), params],
    queryFn: () => paymentService.getPaymentHistory(params),
    staleTime: 1000 * 30, // 30 seconds - faster updates
  });
};

export const usePaymentByBookingId = (bookingId: string) => {
  return useQuery({
    queryKey: paymentKeys.details(bookingId),
    queryFn: () => paymentService.getPaymentByBookingId(bookingId),
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to invalidate payment queries
export const useInvalidatePaymentQueries = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: paymentKeys.all });
  };
};