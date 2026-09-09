'use client';

import { useEffect } from 'react';

// Get CSRF token from cookie
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const match = document.cookie.match(/(^|;) ?csrfToken=([^;]*)(;|$)/);
  return match ? match[2] : null;
};

// Fetch CSRF token from server
const fetchAdminCsrfToken = async (): Promise<void> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      console.log('Admin CSRF token initialized successfully');
    } else {
      console.error('Failed to fetch admin CSRF token');
    }
  } catch (error) {
    console.error('Error fetching admin CSRF token:', error);
  }
};

export function AdminCsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize CSRF token when the admin app loads
    const initializeCsrf = async () => {
      // First check if token already exists in cookie
      const existingToken = getCsrfTokenFromCookie();
      if (!existingToken) {
        await fetchAdminCsrfToken();
      } else {
        console.log('Admin CSRF token already exists in cookie');
      }
    };

    initializeCsrf();
  }, []);

  return <>{children}</>;
}
