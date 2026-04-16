import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User, IUser, IAdmin } from '../models/User';
import { Admin } from '../models/Admin';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface AdminRequest extends Request {
  admin?: IAdmin;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('req from the forntend', req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = verifyToken(token);

    console.log('decoded', decoded);

    const user = await User.findById(decoded.id).select('-password');

    console.log('user after verification in auth middleware', user);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
      return;
    }

    const authReq = req as AuthRequest;
    authReq.user = user;
    next();
  } catch (error: any) {

    console.log('jwt erorr name is ',error.name);
    

    // Check if token is expired vs invalid
    if (error.name === 'TokenExpiredError') {
      // Token expired - frontend should use refresh token
      res.status(401).json({
        success: false,
        error: 'Access token expired.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      // Invalid token - completely bad token, need re-login
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
        code: 'TOKEN_INVALID'
      });
    } else {
      // Other JWT errors
      res.status(401).json({
        success: false,
        error: 'Token verification failed.',
        code: 'TOKEN_ERROR'
      });
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.'
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Invalid token. Admin not found.'
      });
      return;
    }

    const adminReq = req as AdminRequest;
    adminReq.admin = admin;
    next();
  } catch (error: any) {
    // Check if token is expired vs invalid
    if (error.name === 'TokenExpiredError') {
      // Token expired - frontend should use refresh token
      res.status(401).json({
        success: false,
        error: 'Access token expired.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      // Invalid token - completely bad token, need re-login
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
        code: 'TOKEN_INVALID'
      });
    } else {
      // Other JWT errors
      res.status(401).json({
        success: false,
        error: 'Token verification failed.',
        code: 'TOKEN_ERROR'
      });
    }
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      const authReq = req as AuthRequest;
      authReq.user = user || undefined;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};
