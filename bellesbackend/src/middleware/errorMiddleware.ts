import { Request, Response, NextFunction } from 'express';
import { BaseResponse } from '@/responses/baseResponse';
import { HTTP_STATUS_CODES } from '@/constants/statusCodes';
import { ERROR_CODES } from '@/constants/errorCodes';
import { logger } from '@/utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (error.message === ERROR_CODES.VALIDATION_ERROR) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(
      BaseResponse.error('Validation failed', ERROR_CODES.VALIDATION_ERROR, error.message)
    );
  }

  if (error.message === ERROR_CODES.INVALID_CREDENTIALS) {
    return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(
      BaseResponse.error('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS)
    );
  }

  if (error.message === ERROR_CODES.USER_NOT_FOUND) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(
      BaseResponse.error('User not found', ERROR_CODES.USER_NOT_FOUND)
    );
  }

  if (error.message === ERROR_CODES.PRODUCT_NOT_FOUND) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(
      BaseResponse.error('Product not found', ERROR_CODES.PRODUCT_NOT_FOUND)
    );
  }

  if (error.message === ERROR_CODES.CART_NOT_FOUND) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(
      BaseResponse.error('Cart not found', ERROR_CODES.CART_NOT_FOUND)
    );
  }

  if (error.message === ERROR_CODES.ORDER_NOT_FOUND) {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json(
      BaseResponse.error('Order not found', ERROR_CODES.ORDER_NOT_FOUND)
    );
  }

  if (error.message === ERROR_CODES.INSUFFICIENT_STOCK) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(
      BaseResponse.error('Insufficient stock', ERROR_CODES.INSUFFICIENT_STOCK)
    );
  }

  if (error.message === ERROR_CODES.EMAIL_ALREADY_EXISTS) {
    return res.status(HTTP_STATUS_CODES.CONFLICT).json(
      BaseResponse.error('Email already exists', ERROR_CODES.EMAIL_ALREADY_EXISTS)
    );
  }

  return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(
    BaseResponse.error('Internal server error', ERROR_CODES.INTERNAL_SERVER_ERROR)
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json(
    BaseResponse.error('Route not found', ERROR_CODES.NOT_FOUND)
  );
};
