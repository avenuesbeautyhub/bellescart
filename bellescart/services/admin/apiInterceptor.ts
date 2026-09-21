'use client';

import { appConfig } from '@/config/appConfig';
import { getAdminAuth as getAuthData, getAdminToken, clearAdminSession, isTokenValid } from '@/auth/admin';
import { generateSignature, generateNonce, getTimestamp, isSensitiveEndpoint } from '@/utils/requestSigning';
import * as Sentry from '@sentry/nextjs';

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

  console.log('Admin token check from interceptor:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    isValid: token ? isTokenValid(token) : false,
    localStorageKeys: typeof window !== 'undefined' ? Object.keys(localStorage) : []
  });

  // Check if token exists and is valid
  if (token && isTokenExpired(token)) {
    console.error('Admin token expired, clearing session');
    globalToast.auth.tokenExpired();
    // For now, clear auth and let user re-login
    if (typeof window !== 'undefined' && window.location.pathname !== '/belles-portel-25') {
      clearAdminSession();
    }
    // You could implement auto-refresh here similar to user interceptor
  }
  
  // If no token after validation check, log this clearly
  if (!token) {
    console.error('No admin token available - user may need to log in again');
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
    console.log('CSRF token check:', {
      method,
      hasCsrfToken: !!cookieCsrf,
      csrfTokenLength: cookieCsrf?.length
    });

    if (cookieCsrf) {
      const headers = authOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
    }
  }

  // Add request signature for sensitive endpoints
  const isSensitive = isSensitiveEndpoint(url);
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  console.log('Signature check:', {
    url,
    method,
    isSensitive,
    isStateChanging,
    shouldSign: isSensitive && isStateChanging
  });

  if (isSensitive && isStateChanging) {
    try {
      let payload = '';
      if (options.body) {
        if (typeof options.body === 'string') {
          payload = options.body;
        } else {
          payload = JSON.stringify(options.body);
        }
      }
      // For DELETE requests, ensure empty string for consistency
      if (method === 'DELETE' && !payload) {
        payload = '';
      }
      const timestamp = getTimestamp();
      const nonce = generateNonce();
      const signature = generateSignature(payload, timestamp, nonce);
      const headers = authOptions.headers as Record<string, string>;
      headers['X-Signature'] = signature;
      headers['X-Timestamp'] = timestamp;
      headers['X-Nonce'] = nonce;

      console.log('Request signature added:', {
        url,
        method,
        payloadLength: payload.length,
        timestamp,
        nonce
      });
    } catch (error) {
      console.warn('Request signing failed, proceeding without signature:', error);
    }
  }

  try {
    // Make initial request
    console.log('Admin API Request:', {
      url: `${API_BASE_URL}${url}`,
      method: authOptions.method,
      headers: authOptions.headers,
      hasToken: !!token,
      isTokenValid: token ? isTokenValid(token) : false
    });

    const response = await fetch(`${API_BASE_URL}${url}`, authOptions);

    console.log('Admin API Response:', {
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
      console.error('Admin 401 Unauthorized error:', {
        url: `${API_BASE_URL}${url}`,
        method: authOptions.method,
        errorData,
        hasToken: !!token,
        tokenValid: token ? isTokenValid(token) : false
      });

      // Only clear session if we're not already on login page to prevent loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/belles-portel-25') {
        console.error('Clearing admin session due to 401 error');
        clearAdminSession();
        globalToast.auth.sessionExpired();

        // Redirect to admin login page
        console.error('Redirecting to login due to 401 error');
        window.location.href = '/belles-portel-25';
      }

      throw new Error('Authentication required');
    }

    // Handle other HTTP errors
    if (response.status >= 400) {
      const errorData = await response.clone().json();
      console.error('Admin API Error:', {
        status: response.status,
        errorData,
        url: `${API_BASE_URL}${url}`,
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
      console.error('Network error in admin API:', error);
      globalToast.error.network();
      
      // Capture network errors with Sentry
      Sentry.captureException(error, {
        tags: {
          area: 'admin-api-interceptor',
          errorType: 'network-error',
        },
        extra: {
          url: `${API_BASE_URL}${url}`,
          method: authOptions.method,
        },
      });
      
      throw new Error('Network error');
    }

    // Log other errors with details
    console.error('Admin API request failed:', {
      url: `${API_BASE_URL}${url}`,
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
          url: `${API_BASE_URL}${url}`,
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

    // Add signature for sensitive endpoints with FormData
    const isSensitive = isSensitiveEndpoint(url);
    if (isSensitive) {
      try {
        // For FormData, we can't easily stringify the body, so use empty string as payload
        const timestamp = getTimestamp();
        const nonce = generateNonce();
        const signature = generateSignature('', timestamp, nonce);
        formDataHeaders['X-Signature'] = signature;
        formDataHeaders['X-Timestamp'] = timestamp;
        formDataHeaders['X-Nonce'] = nonce;

        console.log('FormData signature added for:', url);
      } catch (error) {
        console.warn('Request signing failed for FormData, proceeding without signature:', error);
      }
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

    // Add signature for sensitive endpoints with FormData
    const isSensitive = isSensitiveEndpoint(url);
    if (isSensitive) {
      try {
        // For FormData, we can't easily stringify the body, so use empty string as payload
        const timestamp = getTimestamp();
        const nonce = generateNonce();
        const signature = generateSignature('', timestamp, nonce);
        formDataHeaders['X-Signature'] = signature;
        formDataHeaders['X-Timestamp'] = timestamp;
        formDataHeaders['X-Nonce'] = nonce;

        console.log('FormData signature added for:', url);
      } catch (error) {
        console.warn('Request signing failed for FormData, proceeding without signature:', error);
      }
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
