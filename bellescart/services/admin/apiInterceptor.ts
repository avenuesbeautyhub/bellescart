'use client';

import { appConfig } from '@/config/appConfig';
import { getAdminAuth as getAuthData, getAdminToken, clearAdminSession, isTokenValid } from '@/auth/admin';

const API_BASE_URL = appConfig.apiBaseUrl;

// Get CSRF token from cookie (shared function)
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const match = document.cookie.match(/(^|;) ?csrfToken=([^;]*)(;|$)/);
  return match ? match[2] : null;
};

// Global toast for admin notifications
const globalToast = {
  auth: {
    tokenExpired: () => {
      // You can implement toast notifications here
      console.warn('Admin token expired');
    },
    loginRequired: () => {
      console.warn('Admin login required');
    },
    sessionExpired: () => {
      console.warn('Admin session expired');
    }
  },
  error: {
    network: () => {
      console.error('Network error occurred');
    },
    server: (message: string) => {
      console.error('Server error:', message);
    }
  }
};

// Helper function to check if token is expired (using existing function)
const isTokenExpired = (token: string): boolean => {
  return !isTokenValid(token);
};

// Admin API interceptor function
export const adminApiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  console.log('API Fetch URL:', url); // Debug log

  // Get admin authentication data
  const token = getAdminToken();

  // Check if token exists and is valid
  if (token && isTokenExpired(token)) {
    globalToast.auth.tokenExpired();
    // For now, clear auth and let user re-login
    clearAdminSession();
    // You could implement auto-refresh here similar to user interceptor
  }

  // Add authorization header if token exists
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  // Add CSRF token for state-changing operations
  const method = options.method || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const cookieCsrf = getCsrfTokenFromCookie();
    if (cookieCsrf) {
      const headers = authOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
    }
  }

  try {
    // Make initial request
    const response = await fetch(`${API_BASE_URL}${url}`, authOptions);

    // If response is successful, return it
    if (response.ok) {
      return response;
    }

    // If we get a 401 (Unauthorized), clear auth and redirect
    if (response.status === 401) {
      const errorData = await response.json();
      console.warn('Admin auth error:', errorData);

      clearAdminSession();
      globalToast.auth.sessionExpired();

      // Redirect to admin login page
      if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }

      throw new Error('Authentication required');
    }

    // Handle other HTTP errors
    if (response.status >= 400) {
      const errorData = await response.json();

      if (response.status >= 500) {
        globalToast.error.server(errorData.message || 'Server error');
      }

      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      globalToast.error.network();
      throw new Error('Network error');
    }

    // Re-throw other errors
    throw error;
  }
};

// Helper methods for common HTTP operations
export const adminApi = {
  get: (url: string, options?: RequestInit) =>
    adminApiFetch(url, { ...options, method: 'GET' }),

  post: (url: string, data?: any, options?: RequestInit) =>
    adminApiFetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (url: string, data?: any, options?: RequestInit) =>
    adminApiFetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (url: string, options?: RequestInit) =>
    adminApiFetch(url, { ...options, method: 'DELETE' }),

  // For FormData (file uploads)
  postFormData: (url: string, formData: FormData, options?: RequestInit) => {
    const csrf = getCsrfTokenFromCookie();
    const formDataHeaders: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };
    if (csrf) {
      formDataHeaders['X-CSRF-Token'] = csrf;
    }
    
    return adminApiFetch(url, {
      ...options,
      method: 'POST',
      headers: formDataHeaders,
      body: formData,
      // Don't set Content-Type header for FormData - browser will set it with boundary
    });
  },

  putFormData: (url: string, formData: FormData, options?: RequestInit) => {
    const csrf = getCsrfTokenFromCookie();
    const formDataHeaders: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };
    if (csrf) {
      formDataHeaders['X-CSRF-Token'] = csrf;
    }
    
    return adminApiFetch(url, {
      ...options,
      method: 'PUT',
      headers: formDataHeaders,
      body: formData,
      // Don't set Content-Type header for FormData - browser will set it with boundary
    });
  },
};
