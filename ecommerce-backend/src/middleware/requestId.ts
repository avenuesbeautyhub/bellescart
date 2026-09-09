import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createLogger } from '../utils/logger';

const logger = createLogger('RequestIdMiddleware');

/**
 * Request ID Middleware
 * Generates unique IDs for each incoming request and adds them to request/response headers
 * Enables tracing requests across logs and services for audit trails
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate or retrieve request ID
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  
  // Add request ID to request object
  req.id = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log the request ID assignment
  logger.debug('Request ID assigned', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  next();
};

// Extend Express Request type to include id property
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
