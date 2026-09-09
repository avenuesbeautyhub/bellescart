import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService, WalletResponse, WalletBalanceResponse } from '@/services/walletService';

// Query keys
export const walletKeys = {
  all: ['wallet'] as const,
  details: () => [...walletKeys.all, 'detail'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
};

// Queries
export const useWallet = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: walletKeys.details(),
    queryFn: () => walletService.getWallet(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: options?.enabled !== false, // Default to enabled
  });
};

export const useWalletBalance = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: () => walletService.getBalance(),
    staleTime: 1000 * 30, // 30 seconds - more frequent updates
    enabled: options?.enabled !== false, // Default to enabled
  });
};

// Mutations
export const useCreditWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { amount: number; description: string; orderId?: string }) => 
      walletService.creditWallet(request),
    onSuccess: () => {
      // Invalidate wallet queries to refetch
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};

export const useDebitWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { amount: number; description: string; orderId?: string }) => 
      walletService.debitWallet(request),
    onSuccess: () => {
      // Invalidate wallet queries to refetch
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
};