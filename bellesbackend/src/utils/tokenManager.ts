import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenManager {
  static generateToken(payload: ITokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  static verifyToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static decodeToken(token: string): ITokenPayload | null {
    try {
      return jwt.decode(token) as ITokenPayload;
    } catch (error) {
      return null;
    }
  }
}
