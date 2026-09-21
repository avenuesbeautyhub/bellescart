export const appConfig = {
  // Toggle between mock data and real API calls
  // Automatically uses mock data in development, real API in production
  // Override by setting NEXT_PUBLIC_ENABLE_MOCK_DATA explicitly
  useMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA !== undefined
    ? process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true'
    : process.env.NODE_ENV === 'development',

  // API base URL
  apiBaseUrl: process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api',

  // Enable/disable console logging
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',

  // Request signing secret for HMAC signature generation
  // MUST match the backend's REQUEST_SIGNING_SECRET
  // In production, this MUST be configured via environment variable
  requestSigningSecret: process.env.NEXT_PUBLIC_REQUEST_SIGNING_SECRET,
};

export const isMockMode = () => appConfig.useMockData;
export const isApiMode = () => !appConfig.useMockData;
