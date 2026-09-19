import { Request, Response, NextFunction } from 'express';
import { captureException, addBreadcrumb } from '../config/sentry';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Add breadcrumb for error context
  addBreadcrumb({
    category: 'error',
    message: err.message,
    level: 'error',
    data: {
      path: req.path,
      method: req.method,
      statusCode: error.statusCode || 500,
    },
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'MongoError', message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }
  console.log('errors',err);
  
  // Capture unexpected errors with Sentry
  // Skip expected errors that don't need monitoring
  const isExpectedError = 
    error.statusCode === 400 || // Bad request
    error.statusCode === 401 || // Unauthorized
    error.statusCode === 403 || // Forbidden
    error.statusCode === 404 || // Not found
    error.statusCode === 422 || // Validation error
    error.statusCode === 429 || // Rate limit
    err.name === 'CastError' ||
    err.name === 'ValidationError' ||
    (err.name === 'MongoError' && (err as any).code === 11000);
  
  if (!isExpectedError) {
    captureException(err, {
      tags: {
        area: 'express-error-handler',
        route: req.path,
        method: req.method,
      },
      extra: {
        statusCode: error.statusCode || 500,
        path: req.path,
        method: req.method,
        requestId: (req as any).id,
      },
    });
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};
