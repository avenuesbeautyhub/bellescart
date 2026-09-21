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




export const isMockMode = () => {
  // Use mock mode if API URL is localhost/127.0.0.1 or not explicitly set
  const apiUrl = appConfig.apiBaseUrl;
  return apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
};
export const isApiMode = () => !isMockMode();
