'use client';

import { useEffect } from 'react';
import { initializeCsrfToken } from '@/services/apiInterceptor';

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Delay CSRF token initialization to prevent rate limiting
    const timer = setTimeout(() => {
      initializeCsrfToken();
    }, 200); // 200ms delay for CSRF token fetch
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
