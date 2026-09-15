export const appConfig = {
  // Toggle between mock data and real API calls
  // Set to true for development with mock data
  // Set to false for production with real API calls
  useMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',

  // API base URL
  apiBaseUrl: process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api',

  // Enable/disable console logging
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',

  // Request signing secret for HMAC signature generation
  // MUST match the backend's REQUEST_SIGNING_SECRET
  requestSigningSecret: process.env.NEXT_PUBLIC_REQUEST_SIGNING_SECRET || 'reqsigningsecretforbelles',
};

export const isMockMode = () => appConfig.useMockData;
export const isApiMode = () => !appConfig.useMockData;
