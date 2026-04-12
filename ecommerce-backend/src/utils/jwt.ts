import jwt, { Secret } from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, jwtSecret);
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.verify(token, jwtSecret) as JWTPayload;
};

export const generateRefreshToken = (user: IUser): string => {
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
