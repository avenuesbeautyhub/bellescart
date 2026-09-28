'use client';

import { getAdminAuth as getAuthData, getAdminToken, clearAdminSession, isTokenValid } from '@/auth/admin';
import { logger } from '@/utils/logger';
import * as Sentry from '@sentry/nextjs';

// Use Next.js API proxy for all backend requests
// The proxy handles HMAC signing server-side
const PROXY_BASE_URL = '/api/proxy/admin';

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
      logger.warn('Admin token expired');
    },
    loginRequired: () => {
      logger.warn('Admin login required');
    },
    sessionExpired: () => {
      logger.warn('Admin session expired');
    }
  },
  error: {
    network: () => {
      logger.error('Network error occurred');
    },
    server: (message: string) => {
      logger.error('Server error', message);
    }
  }
};

// Helper function to check if token is expired (using existing function)
const isTokenExpired = (token: string): boolean => {
  return !isTokenValid(token);
};

// Admin API interceptor function
export const adminApiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  logger.api('Admin API Fetch URL', url);

  // Get admin authentication data
  const token = getAdminToken();

  logger.auth('Admin token check from interceptor', {
    hasToken: !!token,
    isValid: token ? isTokenValid(token) : false,
  });

  // Check if token exists and is valid
  if (token && isTokenExpired(token)) {
    logger.auth('Admin token expired, clearing session');
    globalToast.auth.tokenExpired();
    // For now, clear auth and let user re-login
    if (typeof window !== 'undefined' && window.location.pathname !== '/belles-portel-25') {
      clearAdminSession();
    }
    // You could implement auto-refresh here similar to user interceptor
  }

  // If no token after validation check, log this clearly
  if (!token) {
    logger.auth('No admin token available - user may need to log in again');
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
    logger.csrf('CSRF token check', {
      method,
      hasCsrfToken: !!cookieCsrf,
    });

    if (cookieCsrf) {
      const headers = authOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
    }
  }

  try {
    // Make initial request
    logger.api('Admin API Request', {
      url: `${PROXY_BASE_URL}${url}`,
      method: authOptions.method,
      hasToken: !!token,
      isTokenValid: token ? isTokenValid(token) : false
    });

    const response = await fetch(`${PROXY_BASE_URL}${url}`, authOptions);

    logger.api('Admin API Response', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    // If response is successful, return it
    if (response.ok) {
      return response;
    }

    // If we get a 401 (Unauthorized), clear auth and redirect
    if (response.status === 401) {
      const errorData = await response.clone().json();
      logger.auth('Admin 401 Unauthorized error', {
        url: `${PROXY_BASE_URL}${url}`,
        method: authOptions.method,
        hasToken: !!token,
        tokenValid: token ? isTokenValid(token) : false
      });

      // Only clear session if we're not already on login page to prevent loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/belles-portel-25') {
        logger.auth('Clearing admin session due to 401 error');
        clearAdminSession();
        globalToast.auth.sessionExpired();

        // Redirect to admin login page
        logger.auth('Redirecting to login due to 401 error');
        window.location.href = '/belles-portel-25';
      }

      throw new Error('Authentication required');
    }

    // Handle other HTTP errors
    if (response.status >= 400) {
      const errorData = await response.clone().json();
      logger.error('Admin API Error', {
        status: response.status,
        url: `${PROXY_BASE_URL}${url}`,
        method: authOptions.method
      });

      if (response.status >= 500) {
        globalToast.error.server(errorData.message || 'Server error');
      }

      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      logger.error('Network error in admin API', error);
      globalToast.error.network();
      
      // Capture network errors with Sentry
      Sentry.captureException(error, {
        tags: {
          area: 'admin-api-interceptor',
          errorType: 'network-error',
        },
        extra: {
          url: `${PROXY_BASE_URL}${url}`,
          method: authOptions.method,
        },
      });
      
      throw new Error('Network error');
    }

    // Log other errors with details
    logger.error('Admin API request failed', {
      url: `${PROXY_BASE_URL}${url}`,
      method: authOptions.method,
      error: error instanceof Error ? error.message : error,
      hasToken: !!token,
      tokenValid: token ? isTokenValid(token) : false
    });

    // Capture unexpected errors with Sentry
    if (error instanceof Error && 
        !error.message.includes('401') && 
        !error.message.includes('403') &&
        !error.message.includes('404') &&
        !error.message.includes('422') &&
        !error.message.includes('429') &&
        !error.message.includes('authentication') &&
        !error.message.includes('authorization') &&
        !error.message.includes('token') &&
        !error.message.includes('CSRF')) {
      Sentry.captureException(error, {
        tags: {
          area: 'admin-api-interceptor',
          errorType: 'unexpected-admin-api-error',
        },
        extra: {
          url: `${PROXY_BASE_URL}${url}`,
          method: authOptions.method,
        },
      });
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

  patch: (url: string, data?: any, options?: RequestInit) =>
    adminApiFetch(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (url: string, options?: RequestInit) =>
    adminApiFetch(url, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: undefined // Ensure DELETE has no body for signature consistency
    }),

  // For FormData (file uploads)
  postFormData: async (url: string, formData: FormData, options?: RequestInit) => {
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

  putFormData: async (url: string, formData: FormData, options?: RequestInit) => {
    const csrf = getCsrfTokenFromCookie();
    const formDataHeaders: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };
    if (csrf) {
      formDataHeaders['X-CSRF-Token'] = csrf;
    }

    // Note: Request signing is now handled by the Next.js API proxy server-side
    // We no longer add signatures client-side

    return adminApiFetch(url, {
      ...options,
      method: 'PUT',
      headers: formDataHeaders,
      body: formData,
      // Don't set Content-Type header for FormData - browser will set it with boundary
    });
  },
};
