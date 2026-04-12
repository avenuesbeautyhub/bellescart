export const appConfig = {
  // Toggle between mock data and real API calls
  // Set to true for development with mock data
  // Set to false for production with real API calls
  useMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',

  // API base URL
  apiBaseUrl: process.env.BACKEND_API_URL || 'http://localhost:5000/api',

  // Enable/disable console logging
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
};

export const isMockMode = () => appConfig.useMockData;
export const isApiMode = () => !appConfig.useMockData;
