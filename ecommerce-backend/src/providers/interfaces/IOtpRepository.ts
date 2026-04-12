import { IOtp } from '../../models/Otp';

export interface IOtpRepository {
  create(email: string, otp: number, expiresAt: Date, userData?: { name: string; email: string; password: string; phone?: string }): Promise<void>;
  findByEmailAndOtp(email: string, otp: number): Promise<IOtp | null>;
  markAsUsed(id: string): Promise<void>;
  getUserData(email: string): Promise<{ name: string; email: string; password: string; phone?: string } | null>;
  findByEmail(email: string): Promise<IOtp | null>;
  deleteOtpForEmail(email: string): Promise<void>;
  deleteExpired(): Promise<void>;
  updateOtp(email: string, otp: number, expiresAt: Date): Promise<void>;
}
