import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';
import { createLogger } from '../utils/logger';

const logger = createLogger('RequestSigningMiddleware');

/**
 * Request Signing Middleware
 * Implements HMAC-based request signing for high-risk operations
 * Validates signature before processing to ensure request integrity
 * Prevents replay attacks with timestamp validation
 */

// Configuration
const SIGNATURE_HEADER = 'X-Signature';
const TIMESTAMP_HEADER = 'X-Timestamp';
const NONCE_HEADER = 'X-Nonce';
const SHARED_SECRET = process.env.REQUEST_SIGNING_SECRET || 'default-secret-change-in-production';

// Timestamp validation window (5 minutes)
const TIMESTAMP_TOLERANCE = 5 * 60 * 1000;

// Nonce store to prevent replay attacks (in production, use Redis)
const nonceStore = new Map<string, number>();
const NONCE_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Clean expired nonces
 */
const cleanExpiredNonces = (): void => {
  const now = Date.now();
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (now - timestamp > NONCE_EXPIRY) {
      nonceStore.delete(nonce);
    }
  }
};

/**
 * Generate signature for request
 * @param payload - Request body as string
 * @param timestamp - Request timestamp
 * @param nonce - Request nonce
 * @returns HMAC-SHA256 signature
 */
export const generateSignature = (payload: string, timestamp: string, nonce: string): string => {
  const data = `${payload}${timestamp}${nonce}`;
  return createHmac('sha256', SHARED_SECRET).update(data).digest('hex');
};

/**
 * Validate request signature
 * @param req - Express request
 * @returns true if signature is valid
 */
const validateSignature = (req: Request): boolean => {
  const signature = req.headers[SIGNATURE_HEADER.toLowerCase()] as string;
  const timestamp = req.headers[TIMESTAMP_HEADER.toLowerCase()] as string;
  const nonce = req.headers[NONCE_HEADER.toLowerCase()] as string;

  if (!signature || !timestamp || !nonce) {
    logger.warn('Missing signature headers', {
      requestId: req.id,
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      hasNonce: !!nonce
    });
    return false;
  }

  // Validate timestamp
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  
  if (isNaN(requestTime) || Math.abs(now - requestTime) > TIMESTAMP_TOLERANCE) {
    logger.warn('Invalid timestamp', {
      requestId: req.id,
      requestTime,
      currentTime: now,
      tolerance: TIMESTAMP_TOLERANCE
    });
    return false;
  }

  // Check for replay attack using nonce
  cleanExpiredNonces();
  if (nonceStore.has(nonce)) {
    logger.warn('Replay attack detected - duplicate nonce', {
      requestId: req.id,
      nonce
    });
    return false;
  }

  // Store nonce
  nonceStore.set(nonce, now);

  // Validate signature
  const payload = JSON.stringify(req.body);
  const expectedSignature = generateSignature(payload, timestamp, nonce);
  
  if (signature !== expectedSignature) {
    logger.warn('Invalid signature', {
      requestId: req.id,
      expectedSignature,
      receivedSignature: signature
    });
    return false;
  }

  return true;
};

/**
 * Request Signing Middleware
 * Applies signature validation to sensitive endpoints
 */
export const requestSigningMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Only apply to state-changing operations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    next();
    return;
  }

  // Skip signature validation for non-sensitive endpoints
  const nonSensitivePaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-otp',
    '/auth/resend-otp',
    '/cart',
    '/products',
    '/categories',
    '/public',
    '/profile',
    '/csrf-token'
  ];

  const isNonSensitive = nonSensitivePaths.some(path => req.path === path || req.path.startsWith(path + '/'));
  if (isNonSensitive) {
    logger.debug('Request signing skipped for non-sensitive path', { requestId: req.id, path: req.path });
    next();
    return;
  }

  // Validate signature for sensitive endpoints
  if (!validateSignature(req)) {
    res.status(403).json({
      success: false,
      error: 'Invalid request signature. Please ensure your request is properly signed.'
    });
    return;
  }

  logger.info('Request signature validated', {
    requestId: req.id,
    method: req.method,
    path: req.path
  });

  next();
};

/**
 * Sensitive endpoints that require request signing
 */
export const SENSITIVE_ENDPOINTS = [
  '/payment/verify',
  '/payment/create-intent',
  '/orders',
  '/wallet',
  '/admin'
];
