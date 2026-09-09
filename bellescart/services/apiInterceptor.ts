import { appConfig } from '@/config/appConfig';
import { authService } from './authService';
import { globalToast } from '@/utils/globalToast';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// CSRF token management
let csrfToken: string | null = null;
let isFetchingCsrfToken = false;
let csrfTokenSubscribers: ((token: string) => void)[] = [];

// Get CSRF token from cookie
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const match = document.cookie.match(/(^|;) ?csrfToken=([^;]*)(;|$)/);
  return match ? match[2] : null;
};

// Fetch CSRF token from server
const fetchCsrfToken = async (): Promise<string> => {
  if (isFetchingCsrfToken) {
    return new Promise((resolve) => {
      csrfTokenSubscribers.push(resolve);
    });
  }

  isFetchingCsrfToken = true;

  try {
    const csrfUrl = `${appConfig.apiBaseUrl}/csrf-token`;
    console.log('Fetching CSRF token from:', csrfUrl);
    
    const response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include',
    });

    console.log('CSRF token response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      const token = data.csrfToken;
      csrfToken = token;

      if (!token) {
        throw new Error('CSRF token not found in response');
      }

      console.log('CSRF token fetched successfully');
      
      // Notify all subscribers
      csrfTokenSubscribers.forEach(callback => callback(token));
      csrfTokenSubscribers = [];

      return token;
    } else {
      console.error('CSRF token fetch failed with status:', response.status);
      throw new Error('Failed to fetch CSRF token');
    }
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    throw error;
  } finally {
    isFetchingCsrfToken = false;
  }
};

// Get CSRF token (from memory, cookie, or fetch if needed)
const getCsrfToken = async (): Promise<string | null> => {
  // First check if we have it in memory
  if (csrfToken) {
    return csrfToken;
  }

  // Check if it's in the cookie
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    csrfToken = cookieToken;
    return csrfToken;
  }

  // Fetch from server
  try {
    return await fetchCsrfToken();
  } catch (error) {
    // Silent fail - token will be fetched on-demand when needed
    return null;
  }
};

// Export function to initialize CSRF token (call this on app startup)
// This is optional - token will be fetched on-demand when needed
export const initializeCsrfToken = async (): Promise<void> => {
  try {
    await getCsrfToken();
  } catch (error) {
    // Silent fail - token will be fetched on-demand when needed
  }
};

// Add subscribers waiting for token refresh
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers that token has been refreshed
const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Create an enhanced fetch function with automatic token refresh
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Get current access token - using same keys as auth context
  const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('bellescart_token');
  };

  // Get current refresh token - using same keys as auth context
  const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('bellescart_refresh_token');
  };

  // Get current access token
  const token = getAccessToken();
  const refreshToken = getRefreshToken();

  // Handle different token scenarios
  if (!token && !refreshToken) {
    // Both tokens missing - log warning but continue with request in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('No authentication tokens found. Request may fail.');
    } else {
      // In production, redirect to login immediately
      // Prevent redirect loops by checking current path
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        console.warn('No authentication tokens found. Redirecting to login.');
        globalToast.auth.tokenRefreshFailed();
        window.location.href = '/login';
      }
      return Promise.reject(new Error('No authentication tokens found. Please login.'));
    }
  } else if (!token && refreshToken) {
    // Access token missing but refresh token exists - attempt auto refresh
    console.log('Access token missing but refresh token exists. Will attempt refresh on 401.');
    globalToast.auth.tokenExpired();
    // Continue with normal flow - will trigger refresh on 401
  }

  // Add authorization header if token exists
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  };

  // Add CSRF token for state-changing operations
  const method = options.method || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    // Try to get CSRF token from cookie first (synchronous)
    const cookieCsrf = getCsrfTokenFromCookie();
    if (cookieCsrf) {
      const headers = authOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
    } else {
      // If not in cookie, fetch it synchronously before the request
      try {
        const csrf = await getCsrfToken();
        if (csrf) {
          const headers = authOptions.headers as Record<string, string>;
          headers['X-CSRF-Token'] = csrf;
        } else {
          // If still no token, try one more time to fetch directly
          const directCsrf = await fetchCsrfToken();
          if (directCsrf) {
            const headers = authOptions.headers as Record<string, string>;
            headers['X-CSRF-Token'] = directCsrf;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch CSRF token, request may fail:', error);
      }
    }
  }

  try {
    // Make initial request
    const fullUrl = url.startsWith('http') ? url : appConfig.apiBaseUrl + url;
    console.log(`API Request: ${fullUrl}`);
    const response = await fetch(fullUrl, authOptions);
    console.log(`API Response: ${response.status} ${response.statusText}`);

    // If response is successful, return it
    if (response.ok) {
      return response;
    }

    // If we get a 401 (Unauthorized), check error type
    if (response.status === 401) {
      const errorData = await response.json();

      // Check if it's token expired (should refresh) vs token invalid (should re-login)
      if (errorData.code === 'TOKEN_EXPIRED') {
        const refreshToken = authService.getRefreshToken();

        if (!refreshToken) {
          // No refresh token available, user needs to login again
          globalToast.auth.tokenRefreshFailed();
          authService.logout();
          throw new Error('Session expired. Please login again.');
        }

        // If we're already refreshing, wait for it to complete
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            addRefreshSubscriber(async (newToken: string) => {
              try {
                const csrf = getCsrfTokenFromCookie();
                const retryHeaders: Record<string, string> = {
                  ...(options.headers as Record<string, string>),
                  Authorization: `Bearer ${newToken}`,
                };
                if (csrf) {
                  retryHeaders['X-CSRF-Token'] = csrf;
                }
                
                const retryResponse = await fetch(fullUrl, {
                  ...options,
                  headers: retryHeaders,
                });

                if (retryResponse.ok) {
                  resolve(retryResponse);
                } else {
                  reject(new Error('Request failed after token refresh'));
                }
              } catch (error) {
                reject(error);
              }
            });
          });
        }

        // Start refresh process
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const refreshResponse = await authService.refreshToken();

          if (refreshResponse.success && refreshResponse.data?.token) {
            const newToken = refreshResponse.data.token;

            // Show success toast for token refresh
            globalToast.auth.tokenRefreshed();

            // Notify all waiting subscribers
            notifyRefreshSubscribers(newToken);

            // Retry original request with new token
            const csrf = getCsrfTokenFromCookie();
            const retryHeaders: Record<string, string> = {
              ...(options.headers as Record<string, string>),
              Authorization: `Bearer ${newToken}`,
            };
            if (csrf) {
              retryHeaders['X-CSRF-Token'] = csrf;
            }
            
            const retryResponse = await fetch(fullUrl, {
              ...options,
              headers: retryHeaders,
            });

            return retryResponse;
          } else {
            // Refresh failed, clear tokens and redirect to login
            globalToast.auth.tokenRefreshFailed();
            authService.logout();
            throw new Error('Session expired. Please login again.');
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          globalToast.auth.tokenRefreshFailed();
          authService.logout();
          throw new Error('Session expired. Please login again.');
        } finally {
          isRefreshing = false;
        }
      } else if (errorData.code === 'TOKEN_INVALID') {
        // Token is invalid, user needs to login again
        globalToast.auth.tokenInvalid();
        authService.logout();
        throw new Error('Invalid token. Please login again.');
      } else {
        // Other JWT errors
        globalToast.auth.tokenInvalid();
        authService.logout();
        throw new Error('Token verification failed. Please login again.');
      }
    }

    // For other error statuses, return response as-is
    return response;

  } catch (error) {
    // If it's not a 401 error or refresh failed, throw error
    throw error;
  }
};

// Helper methods for common HTTP operations
export const apiGet = (url: string, options: RequestInit = {}) =>
  apiFetch(url, { ...options, method: 'GET' });

export const apiPost = (url: string, data?: any, options: RequestInit = {}) =>
  apiFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiPut = (url: string, data?: any, options: RequestInit = {}) =>
  apiFetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiDelete = (url: string, options: RequestInit = {}) =>
  apiFetch(url, { ...options, method: 'DELETE' });

// Public API fetch function that doesn't require authentication
export const publicApiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Add full backend URL for relative URLs
  const fullUrl = appConfig.apiBaseUrl + url;

  const publicOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors' as RequestMode,
    credentials: 'include' as RequestCredentials,
  };

  // Add CSRF token for state-changing operations in public API
  const method = options.method || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const cookieCsrf = getCsrfTokenFromCookie();
    if (cookieCsrf) {
      const headers = publicOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
    } else {
      // If not in cookie, fetch it before the request
      try {
        const csrf = await getCsrfToken();
        if (csrf) {
          const headers = publicOptions.headers as Record<string, string>;
          headers['X-CSRF-Token'] = csrf;
        } else {
          // If still no token, try one more time to fetch directly
          const directCsrf = await fetchCsrfToken();
          if (directCsrf) {
            const headers = publicOptions.headers as Record<string, string>;
            headers['X-CSRF-Token'] = directCsrf;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch CSRF token for public API, request may fail:', error);
      }
    }
  }

  try {
    console.log('Public API Request URL:', fullUrl);
    const response = await fetch(fullUrl, publicOptions);
    console.log('Public API Response Status:', response.status);
    return response;
  } catch (error) {
    console.error('Public API fetch error:', error);
    console.error('Full URL that failed:', fullUrl);
    throw error;
  }
};

// Helper methods for public API calls
export const publicApiGet = (url: string, options: RequestInit = {}) =>
  publicApiFetch(url, { ...options, method: 'GET' });
