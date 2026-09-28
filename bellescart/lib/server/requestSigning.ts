import { createHmac, randomBytes } from 'crypto';

/**
 * Server-side request signing utility
 * This runs only on the Next.js server, never in the browser
 * Uses REQUEST_SIGNING_SECRET from server environment variables
 */

/**
 * Generate HMAC-SHA256 signature for request signing
 * @param payload - Request body as string
 * @param timestamp - Request timestamp as string
 * @param nonce - Request nonce as string
 * @returns HMAC-SHA256 signature
 */
export const generateSignature = (payload: string, timestamp: string, nonce: string): string => {
  const secret = process.env.REQUEST_SIGNING_SECRET;
  
  if (!secret) {
    throw new Error('REQUEST_SIGNING_SECRET not configured on server');
  }
  
  const data = `${payload}${timestamp}${nonce}`;
  const signature = createHmac('sha256', secret).update(data).digest('hex');
  return signature;
};

/**
 * Generate unique nonce for request signing
 * @returns Unique nonce string
 */
export const generateNonce = (): string => {
  return randomBytes(16).toString('hex');
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
    '/orders',
    '/admin',
    '/payment/verify',
    '/payment/create-intent',
    '/payment/create-record',
    '/payment/confirm',
    '/payment/cancel',
    '/wallet/credit',
    '/wallet/debit'
  ];

  // Skip auth endpoints (including refresh-token)
  if (url.includes('/auth/')) {
    return false;
  }

  // Skip csrf-token endpoint
  if (url.includes('/csrf-token')) {
    return false;
  }

  // Skip review endpoints
  if (url.includes('/reviews')) {
    return false;
  }

  // Skip read-only wallet and payment endpoints (GET requests)
  if (url.includes('/wallet') && !url.includes('/credit') && !url.includes('/debit')) {
    return false;
  }
  if (url.includes('/payment') && !url.includes('/verify') && !url.includes('/create-intent') && !url.includes('/create-record') && !url.includes('/confirm') && !url.includes('/cancel')) {
    return false;
  }

  // Skip preferences endpoints
  if (url.includes('/preferences')) {
    return false;
  }

  return sensitiveEndpoints.some(endpoint => url.includes(endpoint));
};
