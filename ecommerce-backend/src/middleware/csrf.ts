import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('CSRFMiddleware');

/**
 * CSRF Protection Middleware
 * Implements CSRF token validation for state-changing operations (POST, PUT, DELETE, PATCH)
 * Uses Double Submit Cookie pattern for token validation
 */
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  // Skip CSRF validation for authentication endpoints (no session yet)
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-otp',
    '/auth/resend-otp',
    '/csrf-token'
  ];

  const isAuthPath = authPaths.some(path => req.path === path || req.path.startsWith(path + '/'));
  if (isAuthPath) {
    logger.debug('CSRF skipped for auth path', { requestId: req.id, path: req.path });
    next();
    return;
  }

  // Skip CSRF validation for public endpoints (no authentication required)
  if (req.path.startsWith('/public')) {
    logger.debug('CSRF skipped for public path', { requestId: req.id, path: req.path });
    next();
    return;
  }

  // Skip CSRF validation for products and categories (publicly accessible)
  if (req.path.startsWith('/products') || req.path.startsWith('/categories')) {
    logger.debug('CSRF skipped for public resource path', { requestId: req.id, path: req.path });
    next();
    return;
  }

  // Get CSRF token from header
  const csrfToken = req.headers['x-csrf-token'] as string;
  
  // Get CSRF token from cookie
  const csrfCookie = req.cookies?.csrfToken;

  if (!csrfToken || !csrfCookie) {
    logger.warn('CSRF token missing', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      hasHeaderToken: !!csrfToken,
      hasCookieToken: !!csrfCookie
    });
    
    res.status(403).json({
      success: false,
      error: 'CSRF token missing. Please refresh the page and try again.'
    });
    return;
  }

  // Validate CSRF token
  if (csrfToken !== csrfCookie) {
    logger.warn('CSRF token mismatch', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      ip: req.ip
    });
    
    res.status(403).json({
      success: false,
      error: 'CSRF token invalid. Please refresh the page and try again.'
    });
    return;
  }

  // CSRF token valid, proceed
  logger.debug('CSRF token validated', {
    requestId: req.id,
    method: req.method,
    path: req.path
  });
  
  next();
};

/**
 * Generate CSRF Token
 * Generates a new CSRF token and sets it in a cookie
 */
export const generateCsrfToken = (req: Request, res: Response): string => {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set CSRF token in HTTP-only cookie
  res.cookie('csrfToken', token, {
    httpOnly: false, // Must be accessible to JavaScript for X-CSRF-Token header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  logger.debug('CSRF token generated', {
    requestId: req.id
  });
  
  return token;
};

/**
 * CSRF Token Endpoint Middleware
 * Generates and returns a CSRF token for the client
 */
export const csrfTokenEndpoint = (req: Request, res: Response): void => {
  const token = generateCsrfToken(req, res);
  
  res.json({
    success: true,
    csrfToken: token
  });
};
