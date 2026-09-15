'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Custom retry logic for rate limiting
const shouldRetry = (failureCount: number, error: any) => {
  // Don't retry on 4xx errors (except 429 rate limit)
  if (error?.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false;
  }
  
  // Retry 429 errors up to 3 times
  if (error?.status === 429) {
    return failureCount < 3;
  }
  
  // Retry other errors (network issues, 5xx) up to 2 times
  return failureCount < 2;
};

// Custom retry delay with exponential backoff for rate limiting
const retryDelay = (attemptIndex: number, error: any) => {
  // Longer delays for 429 errors
  if (error?.status === 429) {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * 2 ** attemptIndex, 30000); // Max 30s delay
  }
  
  // Standard delay for other errors
  return Math.min(1000 * 2 ** attemptIndex, 10000); // Max 10s delay
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Aggressive caching to reduce API calls
            staleTime: 1000 * 60 * 5, // 5 minutes default stale time
            gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
            
            // Smart retry logic
            retry: shouldRetry,
            retryDelay: retryDelay,
            
            // Disable automatic refetches to prevent rate limiting
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            
            // Request deduplication
            networkMode: 'always',
          },
          mutations: {
            retry: 1, // Retry mutations once for network issues
            retryDelay: 1000, // 1 second delay for mutation retries
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}