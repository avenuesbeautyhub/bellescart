'use client';

import { useEffect } from 'react';
import { initializeCsrfToken } from '@/services/apiInterceptor';

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize CSRF token when the app loads
    initializeCsrfToken();
  }, []);

  return <>{children}</>;
}
