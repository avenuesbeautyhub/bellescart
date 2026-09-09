import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService, CartResponse, AddToCartRequest, UpdateCartRequest } from '@/services/cartService';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
};

// BroadcastChannel for cross-tab sync
let broadcastChannel: any = null;

const getCartChannel = () => {
  if (typeof window !== 'undefined' && !broadcastChannel) {
    try {
      broadcastChannel = new (window as any).BroadcastChannel('cart-updates');
    } catch (e) {
      console.warn('BroadcastChannel not supported');
    }
  }
  return broadcastChannel;
};

// Queries
export const useCart = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: cartKeys.items(),
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 5, // 5 minutes (increased to reduce refetches)
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    enabled: options?.enabled !== false, // Default to true unless explicitly disabled
    refetchOnWindowFocus: false, // Disabled to prevent 429 errors
    refetchOnReconnect: false, // Disabled to prevent 429 errors
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // 1 second delay between retries
  });

  // Listen for cart updates from other tabs
  useEffect(() => {
    const channel = getCartChannel();
    if (!channel) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CART_UPDATED') {
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, [queryClient]);

  return query;
};

// Mutations
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddToCartRequest) => cartService.addToCart(request),
    onSuccess: (data) => {
      // Only invalidate and show success if the API call actually succeeded
      if (data.success) {
        // Invalidate cart query to refetch
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
        // Broadcast to other tabs
        const channel = getCartChannel();
        if (channel) {
          channel.postMessage({ type: 'CART_UPDATED' });
        }
      }
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error);
      // Error is already handled in the component with toast
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, request }: { itemId: string; request: UpdateCartRequest }) => 
      cartService.updateCartItem(itemId, request),
    onSuccess: (data) => {
      // Only invalidate and show success if the API call actually succeeded
      if (data.success) {
        // Invalidate cart query to refetch
        queryClient.invalidateQueries({ queryKey: cartKeys.items() });
        // Broadcast to other tabs
        const channel = getCartChannel();
        if (channel) {
          channel.postMessage({ type: 'CART_UPDATED' });
        }
      }
    },
    onError: (error: any) => {
      console.error('Update cart item error:', error);
      // Error is already handled in the component with toast
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      // Broadcast to other tabs
      const channel = getCartChannel();
      if (channel) {
        channel.postMessage({ type: 'CART_UPDATED' });
      }
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.items() });
      // Broadcast to other tabs
      const channel = getCartChannel();
      if (channel) {
        channel.postMessage({ type: 'CART_UPDATED' });
      }
    },
  });
};

export const useValidateStock = () => {
  return useMutation({
    mutationFn: () => cartService.validateStock(),
  });
};
