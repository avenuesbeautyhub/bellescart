import jwt, { Secret } from 'jsonwebtoken';
import { IUser, IAdmin } from '../models/User';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Generic user type that works with both IUser and IAdmin
type UserForToken = IUser | IAdmin;

export const generateToken = (user: UserForToken): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '1h'
  });
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.verify(token, jwtSecret) as JWTPayload;
};

export const generateRefreshToken = (user: UserForToken): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };

  

  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '30d'
  });
};
