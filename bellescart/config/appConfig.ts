export const appConfig = {
  // Toggle between mock data and real API calls
  // Use ENABLE_MOCK_DATA to explicitly control, otherwise check NODE_ENV
  useMockData: process.env.ENABLE_MOCK_DATA !== undefined
    ? process.env.ENABLE_MOCK_DATA === 'true'
    : process.env.NODE_ENV === 'development',

  // API base URL - prioritize PROD_BACKEND_API_URL if set, otherwise use DEV
  // This allows using production backend even in dev mode
  apiBaseUrl: process.env.PROD_BACKEND_API_URL || process.env.DEV_BACKEND_API_URL || 'http://127.0.0.1:5000/api',
  
  // Enable/disable console logging
  enableLogging: process.env.ENABLE_LOGGING === 'true',
};

// Log API configuration for debugging
if (typeof window !== 'undefined') {
  console.log('=== API Configuration ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Using Next.js API Proxy: YES');
  console.log('Proxy Base URL: /api/proxy');
  console.log('Request signing: Handled server-side by proxy');
  console.log('========================');
}

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
