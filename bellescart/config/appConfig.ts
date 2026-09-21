export const appConfig = {
  // Toggle between mock data and real API calls
  // Automatically uses mock data in development, real API in production
  // Override by setting ENABLE_MOCK_DATA explicitly
  useMockData: process.env.ENABLE_MOCK_DATA !== undefined
    ? process.env.ENABLE_MOCK_DATA === 'true'
    : process.env.NODE_ENV === 'development',

  // API base URL
  apiBaseUrl: (process.env.NODE_ENV === 'production'
    ? process.env.PROD_BACKEND_API_URL 
    : process.env.DEV_BACKEND_API_URL) || 'http://127.0.0.1:5000/api',
  // Enable/disable console logging
  enableLogging: process.env.ENABLE_LOGGING === 'true',

  // Request signing secret for HMAC signature generation
  // MUST match the backend's REQUEST_SIGNING_SECRET
  // In production, this MUST be configured via environment variable
  // This is now server-side only to prevent exposing the secret to the browser
  requestSigningSecret: process.env.REQUEST_SIGNING_SECRET,
};

// Log API configuration for debugging
if (typeof window !== 'undefined') {
  console.log('=== API Configuration ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DEV_BACKEND_API_URL:', process.env.DEV_BACKEND_API_URL);
  console.log('PROD_BACKEND_API_URL:', process.env.PROD_BACKEND_API_URL);
  console.log('Final API Base URL:', appConfig.apiBaseUrl);
  console.log('Is Production:', process.env.NODE_ENV === 'production');
  console.log('Using Production URL:', process.env.NODE_ENV === 'production' ? 'YES' : 'NO');
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




export const isMockMode = () => {
  // Use mock mode if API URL is localhost/127.0.0.1 or not explicitly set
  const apiUrl = appConfig.apiBaseUrl;
  return apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
};
export const isApiMode = () => !isMockMode();
