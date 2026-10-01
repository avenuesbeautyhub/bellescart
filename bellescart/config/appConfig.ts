// Server-side configuration (only used on server)
export const appConfig = {
  // Toggle between mock data and real API calls
  // Use ENABLE_MOCK_DATA to explicitly control, otherwise check NODE_ENV
  useMockData: process.env.ENABLE_MOCK_DATA !== undefined
    ? process.env.ENABLE_MOCK_DATA === 'true'
    : process.env.NODE_ENV === 'development',

  // API base URL - based on NODE_ENV
  // NOTE: This is only used on server-side. Client-side uses empty string.
  apiBaseUrl: process.env.NODE_ENV === 'production'
    ? process.env.PROD_BACKEND_API_URL!
    : process.env.DEV_BACKEND_API_URL!,

  // Enable/disable console logging
  enableLogging: process.env.ENABLE_LOGGING === 'true',
};

// Helper function to get the appropriate API base URL
// This ensures client-side never accesses server-side environment variables
export const getApiBaseUrl = (): string => {
  // Client-side: always return empty string (apiInterceptor adds /api/proxy)
  if (typeof window !== 'undefined') {
    return '';
  }
  // Server-side: use the configured backend URL
  return appConfig.apiBaseUrl;
};



// Export helper function to check API configuration
export const getApiConfigInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    devApiUrl: process.env.DEV_BACKEND_API_URL,
    prodApiUrl: process.env.PROD_BACKEND_API_URL,
    finalApiUrl: appConfig.apiBaseUrl,
    isProduction: process.env.NODE_ENV === 'production',
    isUsingLocalhost: appConfig.apiBaseUrl.includes('localhost') || appConfig.apiBaseUrl.includes('127.0.0.1'),
  };
};

// Client-side configuration (for debugging only)
export const clientConfig = {
  apiBaseUrl: '/api/proxy', // Always use the proxy on client side
  isProduction: process.env.NODE_ENV === 'production',
};




export const isMockMode = () => {
  // Use mock mode only if explicitly enabled via environment variable
  return process.env.ENABLE_MOCK_DATA === 'true';
};
export const isApiMode = () => !isMockMode();
