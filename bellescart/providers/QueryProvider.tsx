'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Custom retry logic with exponential backoff for rate limiting
const retryWithBackoff = (failureCount: number, error: any) => {
  // Don't retry on 4xx errors (except 429 rate limit)
  if (error?.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
    return false;
  }
  
  // Retry 429 errors with exponential backoff
  if (error?.status === 429) {
    // Max 3 retries for rate limit errors
    if (failureCount >= 3) {
      return false;
    }
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, failureCount) * 1000;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Retry other errors (network issues, 5xx) up to 2 times
  if (failureCount < 2) {
    return true;
  }
  
  return false;
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
            retry: retryWithBackoff,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Max 30s delay
            
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