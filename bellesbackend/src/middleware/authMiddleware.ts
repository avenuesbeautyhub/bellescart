import { Request, Response, NextFunction } from 'express';
import { TokenManager } from '@/utils/tokenManager';
import { BaseResponse } from '@/responses/baseResponse';
import { HTTP_STATUS_CODES } from '@/constants/statusCodes';
import { ERROR_CODES } from '@/constants/errorCodes';

export interface IAuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(
        BaseResponse.error('Access token is required', ERROR_CODES.TOKEN_INVALID)
      );
    }

    const token = authHeader.substring(7);
    const payload = TokenManager.verifyToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json(
      BaseResponse.error('Invalid or expired token', ERROR_CODES.TOKEN_EXPIRED)
    );
  }
};

export const adminMiddleware = (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(HTTP_STATUS_CODES.FORBIDDEN).json(
      BaseResponse.error('Admin access required', ERROR_CODES.FORBIDDEN)
    );
  }
  next();
};
