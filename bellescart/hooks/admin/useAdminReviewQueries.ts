import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminReviewService, AdminReview } from '@/services/admin/reviewService';

// Query keys
export const adminReviewKeys = {
  all: ['admin', 'reviews'] as const,
  lists: () => [...adminReviewKeys.all, 'list'] as const,
  list: (params?: any) => [...adminReviewKeys.lists(), params] as const,
  details: () => [...adminReviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminReviewKeys.details(), id] as const,
  summary: (productId: string) => [...adminReviewKeys.all, 'summary', productId] as const,
};

// Queries
export const useAdminReviews = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  productId?: string;
  userId?: string;
}, enabled = true) => {
  return useQuery({
    queryKey: adminReviewKeys.list(params),
    queryFn: () => adminReviewService.getAllReviews(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: enabled,
  });
};

export const useAdminReviewSummary = (productId: string) => {
  return useQuery({
    queryKey: adminReviewKeys.summary(productId),
    queryFn: () => adminReviewService.getReviewSummary(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutations
export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, status }: {
      reviewId: string;
      status: 'pending' | 'approved' | 'rejected';
    }) => adminReviewService.updateReviewStatus(reviewId, status),
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.all });
    },
  });
};

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => adminReviewService.deleteReview(reviewId),
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.all });
    },
  });
};