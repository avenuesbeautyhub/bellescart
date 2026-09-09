'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10, // 10 minutes (increased to reduce refetches)
            gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
            retry: 0, // Disabled retries to prevent error cascades
            refetchOnWindowFocus: false, // Disabled to prevent 429 errors
            refetchOnReconnect: false, // Disabled to prevent 429 errors
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