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
    '/api/csrf-token',
    '/admin/login',
    '/admin/register',
    '/cart/validate-stock' // Stock validation is a read operation, shouldn't require CSRF
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

  // Skip CSRF validation for preferences endpoints (user settings)
  if (req.path.startsWith('/preferences')) {
    logger.debug('CSRF skipped for preferences path', { requestId: req.id, path: req.path });
    next();
    return;
  }

  // Skip CSRF validation for privacy endpoints (user settings)
  if (req.path.startsWith('/privacy')) {
    logger.debug('CSRF skipped for privacy path', { requestId: req.id, path: req.path });
    next();
    return;
  }

  // Note: wallet and payment endpoints require CSRF protection for security
  // They are NOT skipped - must include valid CSRF token

  // Get CSRF token from header
  const csrfToken = req.headers['x-csrf-token'] as string;
  
  // Get CSRF token from cookie (try multiple variations)
  const csrfCookie = req.cookies?.csrfToken || req.cookies?.csrftoken;

  logger.info('CSRF validation check', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    hasHeaderToken: !!csrfToken,
    hasCookieToken: !!csrfCookie,
    headerTokenPreview: csrfToken ? csrfToken.substring(0, 10) + '...' : 'none',
    cookieTokenPreview: csrfCookie ? csrfCookie.substring(0, 10) + '...' : 'none',
    headerTokenLength: csrfToken?.length || 0,
    cookieTokenLength: csrfCookie?.length || 0,
    allCookies: Object.keys(req.cookies || {}),
    allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('csrf') || h.toLowerCase().includes('cookie')),
    rawCookieHeader: req.headers.cookie
  });

  // In development, if cookie is missing but header is present, allow the request
  // This is a development-only fallback to handle cookie issues in local development
  if (!csrfCookie && csrfToken && process.env.NODE_ENV !== 'production') {
    logger.warn('CSRF cookie missing but header present - allowing in development', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      headerTokenPreview: csrfToken.substring(0, 10) + '...'
    });
    next();
    return;
  }

  if (!csrfToken || !csrfCookie) {
    logger.warn('CSRF token missing', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      hasHeaderToken: !!csrfToken,
      hasCookieToken: !!csrfCookie,
      headerTokenPreview: csrfToken ? csrfToken.substring(0, 10) + '...' : 'none',
      cookieTokenPreview: csrfCookie ? csrfCookie.substring(0, 10) + '...' : 'none'
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
      ip: req.ip,
      headerToken: csrfToken.substring(0, 20) + '...',
      cookieToken: csrfCookie.substring(0, 20) + '...',
      headerLength: csrfToken.length,
      cookieLength: csrfCookie.length
    });
    
    res.status(403).json({
      success: false,
      error: 'CSRF token invalid. Please refresh the page and try again.'
    });
    return;
  }

  // CSRF token valid, proceed
  logger.info('CSRF token validated successfully', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    tokenPreview: csrfToken.substring(0, 10) + '...'
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
  
  // Set CSRF token in cookie with environment-specific settings
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: false, // Must be accessible to JavaScript for X-CSRF-Token header
    secure: isProduction, // Only use secure in production
    sameSite: isProduction ? 'strict' as 'strict' : 'lax' as 'lax', // Strict in production, lax in development
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/', // Explicitly set path to root
    domain: undefined // Let browser handle domain automatically
  };
  
  logger.info('Setting CSRF cookie with options', {
    requestId: req.id,
    isProduction,
    cookieOptions: {
      ...cookieOptions,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      domain: cookieOptions.domain
    }
  });
  
  res.cookie('csrfToken', token, cookieOptions);
  
  logger.info('CSRF cookie set command executed', {
    requestId: req.id,
    token: token.substring(0, 10) + '...',
    cookiesAfter: res.getHeader('Set-Cookie')
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
  logger.info('CSRF token endpoint called', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    referer: req.headers.referer,
    cookies: req.cookies,
    rawCookieHeader: req.headers.cookie
  });
  
  const token = generateCsrfToken(req, res);
  
  logger.info('CSRF token generated and set in cookie', {
    requestId: req.id,
    token: token.substring(0, 10) + '...',
    fullToken: token,
    cookieSet: !!res.getHeader('Set-Cookie'),
    cookieValue: res.getHeader('Set-Cookie')
  });
  
  res.json({
    success: true,
    csrfToken: token
  });
};
