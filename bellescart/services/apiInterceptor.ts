import { authService } from './authService';
import { globalToast } from '@/utils/globalToast';
import { logger } from '@/utils/logger';
import * as Sentry from '@sentry/nextjs';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// CSRF token management
let csrfToken: string | null = null;
let isFetchingCsrfToken = false;
let csrfTokenSubscribers: ((token: string) => void)[] = [];

// Request deduplication to prevent duplicate simultaneous requests
const pendingRequests = new Map<string, Promise<Response>>();

const getRequestKey = (url: string, options: RequestInit): string => {
  const method = options.method || 'GET';
  const body = options.body ? String(options.body) : '';
  return `${method}:${url}:${body}`;
};

// Check if request should be deduplicated (only GET requests)
const shouldDeduplicate = (options: RequestInit): boolean => {
  const method = options.method || 'GET';
  return method === 'GET';
};



// Fallback: store CSRF token in localStorage if cookies fail
const CSRF_LOCALSTORAGE_KEY = 'bellescart_csrf_token';

const getCsrfTokenFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem(CSRF_LOCALSTORAGE_KEY);
    if (token) {
      logger.csrf('CSRF token found in localStorage');
      return token;
    }
  } catch (error) {
    logger.csrf('Failed to read CSRF token from localStorage', error);
  }
  return null;
};

const setCsrfTokenInLocalStorage = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CSRF_LOCALSTORAGE_KEY, token);
    logger.csrf('CSRF token stored in localStorage');
  } catch (error) {
    logger.csrf('Failed to store CSRF token in localStorage', error);
  }
};

// Get CSRF token from cookie
const getCsrfTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Try multiple cookie name variations
  const cookieNames = ['csrfToken', 'csrftoken', 'X-CSRF-Token'];

  for (const name of cookieNames) {
    const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
    if (match) {
      const token = match[2].trim();
      logger.csrf(`CSRF token found in cookie '${name}'`);
      return token;
    }
  }

  logger.csrf('CSRF token not found in any cookie');
  return null;
};

// Manually set CSRF token in cookie (fallback if server cookie setting fails)
const setCsrfTokenInCookie = (token: string): void => {
  if (typeof window === 'undefined') return;

  // Set cookie with same options as server
  const expires = new Date();
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  // Match server cookie options exactly
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = 'lax'; // Always use lax for development
  const secure = ''; // Always empty for development (no Secure flag)

  // Set multiple cookie name variations for compatibility
  document.cookie = `csrfToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=${sameSite}${secure}`;
  document.cookie = `csrftoken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=${sameSite}${secure}`;

  logger.csrf('CSRF token manually set in cookie');
};

// Fetch CSRF token from server
const fetchCsrfToken = async (): Promise<string> => {
  if (isFetchingCsrfToken) {
    logger.csrf('CSRF token already being fetched, waiting...');
    return new Promise((resolve) => {
      csrfTokenSubscribers.push(resolve);
    });
  }

  isFetchingCsrfToken = true;

  try {
    const csrfUrl = `/api/proxy/csrf-token`;
    logger.csrf('Fetching CSRF token from', csrfUrl);

    const response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include',
    });

    logger.csrf('CSRF token response status', response.status);

    if (response.ok) {
      const data = await response.json();
      const token = data.csrfToken;

      if (!token) {
        logger.csrf('CSRF token not found in response data');
        throw new Error('CSRF token not found in response');
      }

      // Store token in memory
      csrfToken = token;

      // Check if cookie was updated
      const cookieAfterFetch = getCsrfTokenFromCookie();
      logger.csrf('Cookie after token fetch', cookieAfterFetch ? 'found' : 'not found');
      logger.csrf('Response token matches cookie', cookieAfterFetch === token);

      // If cookie wasn't set by server, set it manually as fallback
      if (!cookieAfterFetch || cookieAfterFetch !== token) {
        logger.csrf('Cookie not set by server or mismatch, setting manually as fallback');
        setCsrfTokenInCookie(token);
      }

      logger.csrf('CSRF token fetched successfully');

      // Notify all subscribers
      csrfTokenSubscribers.forEach(callback => callback(token));
      csrfTokenSubscribers = [];

      return token;
    } else {
      logger.csrf('CSRF token fetch failed with status', response.status);
      const errorText = await response.text();
      logger.csrf('Error response', errorText);
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
  } catch (error) {
    logger.csrf('CSRF token fetch error', error);
    throw error;
  } finally {
    isFetchingCsrfToken = false;
  }
};

// Get CSRF token (from memory, cookie, localStorage, or fetch if needed)
const getCsrfToken = async (): Promise<string | null> => {
  logger.csrf('getCsrfToken called');

  // First check if we have it in memory
  if (csrfToken) {
    logger.csrf('CSRF token found in memory');
    return csrfToken;
  }

  logger.csrf('CSRF token not in memory, checking cookie');

  // Check if it's in the cookie
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    logger.csrf('CSRF token found in cookie, storing in memory');
    csrfToken = cookieToken;
    return csrfToken;
  }

  logger.csrf('CSRF token not in cookie, checking localStorage');

  // Check if it's in localStorage (fallback)
  const localStorageToken = getCsrfTokenFromLocalStorage();
  if (localStorageToken) {
    logger.csrf('CSRF token found in localStorage, storing in memory');
    csrfToken = localStorageToken;
    return csrfToken;
  }

  logger.csrf('CSRF token not in localStorage, fetching from server');

  // Fetch from server
  try {
    const token = await fetchCsrfToken();
    logger.csrf('CSRF token fetch completed, returning', token ? 'token' : 'null');

    // Always prefer the token from the server response (it's the authoritative source)
    // even if the cookie didn't get updated properly
    if (token) {
      csrfToken = token;
      // Store in localStorage as fallback
      setCsrfTokenInLocalStorage(token);
    }

    return token;
  } catch (error) {
    logger.csrf('Failed to fetch CSRF token', error);
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
    logger.csrf('Failed to initialize CSRF token', error);
  }
};

// Force refresh CSRF token - useful when CSRF validation fails
export const forceRefreshCsrfToken = async (): Promise<string> => {
  logger.csrf('Force refreshing CSRF token');

  // Clear existing token from memory and localStorage
  csrfToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CSRF_LOCALSTORAGE_KEY);
    } catch (error) {
      logger.csrf('Failed to clear CSRF token from localStorage', error);
    }
  }

  // Fetch new token from server
  try {
    const newToken = await fetchCsrfToken();
    logger.csrf('CSRF token force refreshed successfully', newToken ? 'token' : 'null');

    // Store in localStorage as fallback
    if (newToken) {
      setCsrfTokenInLocalStorage(newToken);
    }

    return newToken;
  } catch (error) {
    logger.csrf('Failed to force refresh CSRF token', error);
    throw error;
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

  // Use Next.js API proxy for all backend requests
  // The proxy handles HMAC signing server-side
  const proxyBaseUrl = '/api/proxy';

  // Handle different token scenarios
  if (!token && !refreshToken) {
    // Both tokens missing - log warning but continue with request in development
    if (process.env.NODE_ENV === 'development') {
      logger.warn('No authentication tokens found. Request may fail.');
    } else {
      // In production, redirect to login immediately
      // Prevent redirect loops by checking current path
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        logger.warn('No authentication tokens found. Redirecting to login.');
        globalToast.auth.tokenRefreshFailed();
        window.location.href = '/login';
      }
      return Promise.reject(new Error('No authentication tokens found. Please login.'));
    }
  } else if (!token && refreshToken) {
    // Access token missing but refresh token exists - attempt proactive refresh
    logger.auth('Access token missing but refresh token exists. Attempting proactive refresh.');

    // If we're already refreshing, wait for it to complete
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(async (newToken: string) => {
          try {
            const authOptions: RequestInit = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
              credentials: 'include',
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

            // Note: Request signing is now handled by the Next.js API proxy server-side
            // We no longer add signatures client-side

            const fullUrl = url.startsWith('http') ? url : proxyBaseUrl + url;
            const response = await fetch(fullUrl, authOptions);

            if (response.ok) {
              resolve(response);
            } else {
              reject(new Error('Request failed after proactive token refresh'));
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
      logger.auth('Starting proactive token refresh');
      const refreshResponse = await authService.refreshToken();
      logger.auth('Proactive refresh response received');

      if (refreshResponse.success && refreshResponse.data?.token) {
        const newToken = refreshResponse.data.token;
        logger.auth('Proactive token refresh successful');

        // Show success toast for token refresh
        globalToast.auth.tokenRefreshed();

        // Notify all waiting subscribers
        notifyRefreshSubscribers(newToken);

        // Update authOptions with new token
        const authOptions: RequestInit = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
          credentials: 'include',
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

        // Note: Request signing is now handled by the Next.js API proxy server-side
        // We no longer add signatures client-side

        // Make the request with the new token
        const fullUrl = url.startsWith('http') ? url : proxyBaseUrl + url;
        const proactiveKey = getRequestKey(fullUrl, authOptions);
        const proactivePromise = fetch(fullUrl, authOptions);
        pendingRequests.set(proactiveKey, proactivePromise);
        const response = await proactivePromise;

        pendingRequests.delete(proactiveKey);
        return response;
      } else {
        // Refresh failed, clear tokens and redirect to login
        logger.auth('Proactive token refresh failed');
        globalToast.auth.tokenRefreshFailed();
        authService.logout();
        throw new Error('Session expired. Please login again.');
      }
    } catch (refreshError) {
      // Refresh failed, clear tokens
      logger.auth('Proactive token refresh error', refreshError);
      globalToast.auth.tokenRefreshFailed();
      authService.logout();
      throw new Error('Session expired. Please login again.');
    } finally {
      isRefreshing = false;
    }
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
    logger.csrf('Preparing state-changing request', { method, url });

    // Try to get CSRF token from cookie first (synchronous)
    const cookieCsrf = getCsrfTokenFromCookie();
    if (cookieCsrf) {
      const headers = authOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
      logger.csrf('CSRF token from cookie added to request');
    } else {
      // If not in cookie, fetch it synchronously before the request
      try {
        logger.csrf('CSRF token not in cookie, fetching from server');
        const csrf = await getCsrfToken();
        if (csrf) {
          const headers = authOptions.headers as Record<string, string>;
          headers['X-CSRF-Token'] = csrf;
          logger.csrf('CSRF token fetched and added to request');
        } else {
          // If still no token, try one more time to fetch directly
          logger.csrf('CSRF token still not available, fetching directly');
          const directCsrf = await fetchCsrfToken();
          if (directCsrf) {
            const headers = authOptions.headers as Record<string, string>;
            headers['X-CSRF-Token'] = directCsrf;
            logger.csrf('Direct CSRF token fetch successful and added to request');
          } else {
            logger.csrf('CSRF token unavailable for request, may fail CSRF validation');
          }
        }
      } catch (error) {
        logger.csrf('Failed to fetch CSRF token, request may fail', error);
      }
    }

    logger.csrf('Final request headers prepared');
  }

  // Note: Request signing is now handled by the Next.js API proxy server-side
  // We no longer add signatures client-side

  // Build the full URL before the try block so it's accessible in catch
  const fullUrl = url.startsWith('http') ? url : proxyBaseUrl + url;

  // Request deduplication - check if there's already a pending request (only for GET requests)
  const requestKey = getRequestKey(fullUrl, authOptions);
  if (shouldDeduplicate(authOptions) && pendingRequests.has(requestKey)) {
    logger.api(`Reusing existing request for: ${fullUrl}`);
    // Clone the response to allow multiple consumers to read the body
    const originalResponse = await pendingRequests.get(requestKey)!;
    return originalResponse.clone();
  }

  try {
    // Make initial request
    logger.api(`API Request: ${fullUrl}`, {
      method: authOptions.method,
    });

    // Create the request promise and store it for deduplication (only for GET requests)
    const requestPromise = fetch(fullUrl, authOptions);
    if (shouldDeduplicate(authOptions)) {
      pendingRequests.set(requestKey, requestPromise);
    }

    const response = await requestPromise;
    logger.api(`API Response: ${response.status} ${response.statusText}`);

    // If response is successful, return it
    if (response.ok) {
      logger.api('API Response successful, returning response object');
      return response;
    }

    // If we get a 403 (Forbidden), check if it's CSRF error
    if (response.status === 403) {
      let errorData;
      try {
        // Clone the response before parsing to preserve the body for the caller
        const clonedResponse = response.clone();
        errorData = await clonedResponse.json();
      } catch (parseError) {
        logger.error('Failed to parse 403 error response', parseError);
        throw new Error('Request failed. Please try again.');
      }

      // Check if it's CSRF error
      if (errorData.error && errorData.error.toLowerCase().includes('csrf')) {
        logger.csrf('CSRF validation failed, attempting to refresh token and retry');
        
        try {
          // Force refresh CSRF token
          const newCsrfToken = await forceRefreshCsrfToken();
          
          if (newCsrfToken) {
            // Update the in-memory token to ensure consistency
            csrfToken = newCsrfToken;
            
            // Retry the request with new CSRF token
            const retryHeaders: Record<string, string> = {
              ...(options.headers as Record<string, string>),
              Authorization: token ? `Bearer ${token}` : '',
              'X-CSRF-Token': newCsrfToken,
            };

            // Note: Request signing is now handled by the Next.js API proxy server-side
            // We no longer add signatures client-side

            logger.csrf('Retrying request with new CSRF token');

            // Add a small delay to ensure the cookie is properly set in the browser
            await new Promise(resolve => setTimeout(resolve, 100));

            // Double-check the cookie is actually set before retrying
            const finalCookieToken = getCsrfTokenFromCookie();
            logger.csrf('Cookie check before retry', finalCookieToken ? 'found' : 'not found');
            
            // Update the header with the actual cookie value (not the newCsrfToken)
            if (finalCookieToken) {
              retryHeaders['X-CSRF-Token'] = finalCookieToken;
            }

            // Create retry request and handle deduplication
            const retryKey = getRequestKey(fullUrl, { ...options, headers: retryHeaders });
            const retryPromise = fetch(fullUrl, {
              ...options,
              headers: retryHeaders,
              credentials: 'include',
            });
            pendingRequests.set(retryKey, retryPromise);

            const retryResponse = await retryPromise;

            pendingRequests.delete(retryKey);

            if (retryResponse.ok) {
              logger.csrf('Request succeeded after CSRF token refresh');
              return retryResponse;
            } else {
              logger.csrf('Request still failed after CSRF token refresh', retryResponse.status);
              throw new Error('Request failed after security token refresh. Please refresh the page.');
            }
          } else {
            throw new Error('Failed to refresh security token. Please refresh the page.');
          }
        } catch (csrfError) {
          logger.csrf('CSRF token refresh and retry failed', csrfError);
          throw new Error('Security token error. Please refresh the page and try again.');
        }
      }
      
      // If it's not a CSRF error, return the response as-is
      return response;
    }

    // If we get a 401 (Unauthorized), check error type
    if (response.status === 401) {
      let errorData;
      try {
        // Clone the response before parsing to preserve the body for the caller
        const clonedResponse = response.clone();
        errorData = await clonedResponse.json();
      } catch (parseError) {
        logger.error('Failed to parse error response', parseError);
        throw new Error('Authentication failed. Please login again.');
      }

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

                // Note: Request signing is now handled by the Next.js API proxy server-side
                // We no longer add signatures client-side

                const tokenRetryKey = getRequestKey(fullUrl, { ...options, headers: retryHeaders });
                const tokenRetryPromise = fetch(fullUrl, {
                  ...options,
                  headers: retryHeaders,
                  credentials: 'include',
                });
                pendingRequests.set(tokenRetryKey, tokenRetryPromise);

                const retryResponse = await tokenRetryPromise;

                pendingRequests.delete(tokenRetryKey);

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
          logger.auth('Attempting to refresh token');
          const refreshResponse = await authService.refreshToken();
          logger.auth('Refresh token response received');

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

            // Note: Request signing is now handled by the Next.js API proxy server-side
            // We no longer add signatures client-side

            const mainRetryKey = getRequestKey(fullUrl, { ...options, headers: retryHeaders });
            const mainRetryPromise = fetch(fullUrl, {
              ...options,
              headers: retryHeaders,
              credentials: 'include',
            });
            pendingRequests.set(mainRetryKey, mainRetryPromise);

            const retryResponse = await mainRetryPromise;

            pendingRequests.delete(mainRetryKey);
            return retryResponse;
          } else {
            // Refresh failed, clear tokens and redirect to login
            logger.auth('Token refresh failed');
            globalToast.auth.tokenRefreshFailed();
            authService.logout();
            throw new Error('Session expired. Please login again.');
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          logger.auth('Token refresh error', refreshError);
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

    // If we get a 429 (Too Many Requests), show user-friendly message
    if (response.status === 429) {
      logger.warn('Rate limit exceeded', fullUrl);
      // Show a warning toast but don't interrupt the user
      globalToast.general.warning(
        'Too Many Requests',
        'Please wait a moment and try again.'
      );
      throw new Error('Too many requests. Please wait a moment and try again.');
    }

    // For other error statuses, return response as-is
    return response;

  } catch (error) {
    // If it's not a 401 error or refresh failed, throw error
    logger.error('API fetch error', error);

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      logger.error('Network error - failed to connect to API server');
      logger.error('API URL:', fullUrl);
      logger.error('Check if backend server is running and accessible');
      
      // Capture network errors with Sentry (unexpected failures)
      Sentry.captureException(error, {
        tags: {
          area: 'api-interceptor',
          errorType: 'network-error',
        },
        extra: {
          url: fullUrl,
          method: authOptions.method,
        },
      });
      
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }

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
          area: 'api-interceptor',
          errorType: 'unexpected-api-error',
        },
        extra: {
          url: fullUrl,
          method: authOptions.method,
        },
      });
    }

    throw error;
  } finally {
    // Clean up the pending request after completion (only if we deduplicated)
    if (shouldDeduplicate(authOptions)) {
      pendingRequests.delete(requestKey);
    }
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

export const apiPatch = (url: string, data?: any, options: RequestInit = {}) =>
  apiFetch(url, {
    ...options,
    method: 'PATCH',
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
  // Use Next.js API proxy for all backend requests
  // The proxy handles HMAC signing server-side
  const proxyBaseUrl = '/api/proxy';
  const fullUrl = proxyBaseUrl + url;

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
    logger.csrf('Public API - Preparing state-changing request', { method, url });
    const cookieCsrf = getCsrfTokenFromCookie();
    if (cookieCsrf) {
      const headers = publicOptions.headers as Record<string, string>;
      headers['X-CSRF-Token'] = cookieCsrf;
      logger.csrf('Public API - CSRF token from cookie added to request');
    } else {
      // If not in cookie, fetch it before the request
      try {
        logger.csrf('Public API - CSRF token not in cookie, fetching from server');
        const csrf = await getCsrfToken();
        if (csrf) {
          const headers = publicOptions.headers as Record<string, string>;
          headers['X-CSRF-Token'] = csrf;
          logger.csrf('Public API - CSRF token fetched and added to request');
        } else {
          // If still no token, try one more time to fetch directly
          logger.csrf('Public API - CSRF token still not available, fetching directly');
          const directCsrf = await fetchCsrfToken();
          if (directCsrf) {
            const headers = publicOptions.headers as Record<string, string>;
            headers['X-CSRF-Token'] = directCsrf;
            logger.csrf('Public API - Direct CSRF token fetch successful and added to request');
          }
        }
      } catch (error) {
        logger.csrf('Public API - Failed to fetch CSRF token, request may fail', error);
      }
    }
  }

  // Note: Request signing is now handled by the Next.js API proxy server-side
  // We no longer add signatures client-side

  // Request deduplication for public API
  const publicRequestKey = getRequestKey(fullUrl, publicOptions);

  try {
    logger.api('Public API Request URL', fullUrl);

    if (shouldDeduplicate(publicOptions) && pendingRequests.has(publicRequestKey)) {
      logger.api(`Reusing existing public API request for: ${fullUrl}`);
      // Clone the response to allow multiple consumers to read the body
      const originalResponse = await pendingRequests.get(publicRequestKey)!;
      return originalResponse.clone();
    }

    const publicRequestPromise = fetch(fullUrl, publicOptions);
    if (shouldDeduplicate(publicOptions)) {
      pendingRequests.set(publicRequestKey, publicRequestPromise);
    }

    const response = await publicRequestPromise;
    logger.api('Public API Response Status', response.status);

    // If we get a 403 (Forbidden), check if it's CSRF error
    if (response.status === 403) {
      let errorData;
      try {
        // Clone the response before parsing to preserve the body for the caller
        const clonedResponse = response.clone();
        errorData = await clonedResponse.json();
      } catch (parseError) {
        logger.error('Failed to parse 403 error response', parseError);
        throw new Error('Request failed. Please try again.');
      }

      // Check if it's CSRF error
      if (errorData.error && errorData.error.toLowerCase().includes('csrf')) {
        logger.csrf('Public API - CSRF validation failed, attempting to refresh token and retry');
        
        try {
          // Force refresh CSRF token
          const newCsrfToken = await forceRefreshCsrfToken();
          
          if (newCsrfToken) {
            // Update the in-memory token to ensure consistency
            csrfToken = newCsrfToken;
            
            // Retry the request with new CSRF token
            const retryHeaders: Record<string, string> = {
              ...(publicOptions.headers as Record<string, string>),
              'X-CSRF-Token': newCsrfToken,
            };

            logger.csrf('Public API - Retrying request with new CSRF token');

            // Add a small delay to ensure the cookie is properly set in the browser
            await new Promise(resolve => setTimeout(resolve, 100));

            // Double-check the cookie is actually set before retrying
            const finalCookieToken = getCsrfTokenFromCookie();
            logger.csrf('Public API - Cookie check before retry', finalCookieToken ? 'found' : 'not found');
            
            // Update the header with the actual cookie value (not the newCsrfToken)
            if (finalCookieToken) {
              retryHeaders['X-CSRF-Token'] = finalCookieToken;
            }

            const publicRetryKey = getRequestKey(fullUrl, { ...publicOptions, headers: retryHeaders });
            const publicRetryPromise = fetch(fullUrl, {
              ...publicOptions,
              headers: retryHeaders,
              credentials: 'include',
            });
            pendingRequests.set(publicRetryKey, publicRetryPromise);

            const retryResponse = await publicRetryPromise;

            pendingRequests.delete(publicRetryKey);

            if (retryResponse.ok) {
              logger.csrf('Public API - Request succeeded after CSRF token refresh');
              return retryResponse;
            } else {
              logger.csrf('Public API - Request still failed after CSRF token refresh', retryResponse.status);
              throw new Error('Request failed after security token refresh. Please refresh the page.');
            }
          } else {
            throw new Error('Failed to refresh security token. Please refresh the page.');
          }
        } catch (csrfError) {
          logger.csrf('Public API - CSRF token refresh and retry failed', csrfError);
          throw new Error('Security token error. Please refresh the page and try again.');
        }
      }
      
      // If it's not a CSRF error, return the response as-is
      return response;
    }

    return response;
  } catch (error) {
    logger.error('Public API fetch error', error);
    logger.error('Full URL that failed', fullUrl);
    logger.error('Error Environment Details', {
      NODE_ENV: process.env.NODE_ENV,
      usingProxy: true
    });
    
    // Capture unexpected errors with Sentry
    if (error instanceof Error && 
        !error.message.includes('401') && 
        !error.message.includes('403') &&
        !error.message.includes('404') &&
        !error.message.includes('422') &&
        !error.message.includes('429') &&
        !error.message.includes('CSRF')) {
      Sentry.captureException(error, {
        tags: {
          area: 'public-api-interceptor',
          errorType: 'unexpected-public-api-error',
        },
        extra: {
          url: fullUrl,
          method: publicOptions.method,
          nodeEnv: process.env.NODE_ENV,
          usingProxy: true,
        },
      });
    }
    
    throw error;
  } finally {
    // Clean up the pending request after completion (only if we deduplicated)
    if (shouldDeduplicate(publicOptions)) {
      pendingRequests.delete(publicRequestKey);
    }
  }
};

// Helper methods for public API calls
export const publicApiGet = (url: string, options: RequestInit = {}) =>
  publicApiFetch(url, { ...options, method: 'GET' });
