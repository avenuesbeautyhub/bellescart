import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService, WishlistResponse, WishlistItemResponse } from '@/services/wishlistService';

// Query keys
export const wishlistKeys = {
  all: ['wishlist'] as const,
  items: () => [...wishlistKeys.all, 'items'] as const,
};

// Queries
export const useWishlist = () => {
  return useQuery({
    queryKey: wishlistKeys.items(),
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Mutations
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.items() });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onSuccess: () => {
      // Invalidate wishlist query to refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.items() });
    },
  });
};
