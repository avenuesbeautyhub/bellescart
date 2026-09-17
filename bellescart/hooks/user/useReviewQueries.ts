import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, Review, ReviewSummary, ReviewEligibility } from '@/services/reviewService';

// Query keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params?: any) => [...reviewKeys.lists(), params] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  productReviews: (productId: string, params?: any) => [...reviewKeys.all, 'product', productId, params] as const,
  myReviews: (params?: any) => [...reviewKeys.all, 'my', params] as const,
  eligibility: (productId: string) => [...reviewKeys.all, 'eligibility', productId] as const,
  summary: (productId: string) => [...reviewKeys.all, 'summary', productId] as const,
  summaries: (productIds: string[]) => [...reviewKeys.all, 'summaries', productIds.sort()] as const,
};

// Queries
export const useProductReviews = (productId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: reviewKeys.productReviews(productId, params),
    queryFn: () => reviewService.getReviewsByProduct(productId, params),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMyReviews = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: reviewKeys.myReviews(params),
    queryFn: () => reviewService.getMyReviews(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useReviewEligibility = (productId: string) => {
  return useQuery({
    queryKey: reviewKeys.eligibility(productId),
    queryFn: () => reviewService.getReviewEligibility(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter cache for eligibility to reflect recent purchases
  });
};

export const useReviewSummary = (productId: string) => {
  return useQuery({
    queryKey: reviewKeys.summary(productId),
    queryFn: () => reviewService.getReviewSummary(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useReviewSummaries = (productIds: string[]) => {
  return useQuery({
    queryKey: reviewKeys.summaries(productIds),
    queryFn: () => reviewService.getReviewSummaries(productIds),
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Mutations
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      rating: number;
      title?: string;
      comment: string;
      images?: string[];
    }) => reviewService.createReview(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries to force refetch
      queryClient.invalidateQueries({ queryKey: reviewKeys.productReviews(variables.productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(variables.productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(variables.productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
    },
    onError: (error) => {
      console.error('Failed to create review:', error);
    }
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: {
      reviewId: string;
      data: {
        rating?: number;
        title?: string;
        comment?: string;
        images?: string[];
      };
    }) => reviewService.updateReview(reviewId, data),
    onSuccess: (data) => {
      const productId = data.data.review.productId;
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.productReviews(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: (data) => {
      const productId = data.data.review.productId;
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.productReviews(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.summary(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
    },
    onError: (error) => {
      console.error('Failed to delete review:', error);
    }
  });
};