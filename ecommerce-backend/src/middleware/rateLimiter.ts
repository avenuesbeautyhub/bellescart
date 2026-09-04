import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// General API rate limiter - applies to all API routes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health';
  }
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 7, // Limit each IP to 5 login/register attempts per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for order creation (to prevent spam orders)
export const orderRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 orders per hour
  message: {
    success: false,
    error: 'Too many order creation attempts, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for payment processing
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment attempts per windowMs
  message: {
    success: false,
    error: 'Too many payment attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for shipping calculations
export const shippingRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 shipping calculations per minute
  message: {
    success: false,
    error: 'Too many shipping calculation requests, please try again after 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for public endpoints (products, categories)
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for public read-only endpoints
  message: {
    success: false,
    error: 'Too many requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for admin endpoints (authenticated admin users)
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for authenticated admin operations
  message: {
    success: false,
    error: 'Too many admin requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
