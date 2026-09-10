import { appConfig } from '@/config/appConfig';

/**
 * Generate HMAC-SHA256 signature for request signing
 * @param payload - Request body as string
 * @param timestamp - Request timestamp as string
 * @param nonce - Request nonce as string
 * @returns HMAC-SHA256 signature
 */
export const generateSignature = (payload: string, timestamp: string, nonce: string): string => {
  const crypto = require('crypto');
  const secret = appConfig.requestSigningSecret;
  const data = `${payload}${timestamp}${nonce}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Generate unique nonce for request signing
 * @returns Unique nonce string
 */
export const generateNonce = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Get current timestamp for request signing
 * @returns Current timestamp as string
 */
export const getTimestamp = (): string => {
  return Date.now().toString();
};

/**
 * Check if the given URL is a sensitive endpoint that requires request signing
 * @param url - The API endpoint URL
 * @returns true if the endpoint requires request signing
 */
export const isSensitiveEndpoint = (url: string): boolean => {
  const sensitiveEndpoints = [
    '/payment/verify',
    '/payment/create-intent',
    '/orders',
    '/wallet',
    '/admin'
  ];

  // Skip auth endpoints (including refresh-token)
  if (url.includes('/auth/')) {
    return false;
  }

  // Skip csrf-token endpoint
  if (url.includes('/csrf-token')) {
    return false;
  }

  return sensitiveEndpoints.some(endpoint => url.includes(endpoint));
};
