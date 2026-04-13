import { authService } from './authService';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

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
  // Get current access token
  const token = authService.getAccessToken();
  
  // Add authorization header if token exists
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    // Make initial request
    const response = await fetch(url, authOptions);
    
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
          authService.logout();
          throw new Error('Session expired. Please login again.');
        }

        // If we're already refreshing, wait for it to complete
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            addRefreshSubscriber(async (newToken: string) => {
              try {
                const retryResponse = await fetch(url, {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
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
            
            // Notify all waiting subscribers
            notifyRefreshSubscribers(newToken);
            
            // Retry original request with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
            
            return retryResponse;
          } else {
            // Refresh failed, clear tokens and redirect to login
            authService.logout();
            throw new Error('Session expired. Please login again.');
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          authService.logout();
          throw new Error('Session expired. Please login again.');
        } finally {
          isRefreshing = false;
        }
      } else if (errorData.code === 'TOKEN_INVALID') {
        // Invalid token - completely bad token, need re-login
        authService.logout();
        throw new Error('Invalid token. Please login again.');
      } else {
        // Other auth errors
        authService.logout();
        throw new Error('Authentication failed. Please login again.');
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
