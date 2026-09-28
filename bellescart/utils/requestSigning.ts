/**
 * Client-side request signing utilities
 *
 * NOTE: HMAC signing is now handled server-side by the Next.js API proxy.
 * The browser no longer has access to REQUEST_SIGNING_SECRET.
 *
 * These functions are kept for backward compatibility but are no-ops on the client.
 * The actual signing happens in /app/api/proxy/[...path]/route.ts
 */

/**
 * Generate HMAC-SHA256 signature for request signing
 * NOTE: This is a no-op on the client. Signing happens server-side.
 * @param payload - Request body as string
 * @param timestamp - Request timestamp as string
 * @param nonce - Request nonce as string
 * @returns HMAC-SHA256 signature
 */
export const generateSignature = (payload: string, timestamp: string, nonce: string): string => {
  // This is now handled server-side by the proxy
  // Kept for backward compatibility but should not be called from client code
  throw new Error('Request signing is now handled server-side. Use the API proxy instead.');
};

/**
 * Generate unique nonce for request signing
 * NOTE: This is a no-op on the client. Signing happens server-side.
 * @returns Unique nonce string
 */
export const generateNonce = (): string => {
  // This is now handled server-side by the proxy
  throw new Error('Request signing is now handled server-side. Use the API proxy instead.');
};

/**
 * Get current timestamp for request signing
 * NOTE: This is a no-op on the client. Signing happens server-side.
 * @returns Current timestamp as string
 */
export const getTimestamp = (): string => {
  // This is now handled server-side by the proxy
  throw new Error('Request signing is now handled server-side. Use the API proxy instead.');
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
