import { IOtpRepository } from '../providers/interfaces/IOtpRepository';
import { Otp, IOtp } from '../models/Otp';

export class OtpRepository implements IOtpRepository {
  async create(email: string, otp: number, expiresAt: Date, userData?: { name: string; email: string; password: string; phone?: string }): Promise<void> {
    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Create new OTP with user data
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      isUsed: false,
      userData: userData || null
    });
  }

  async findByEmail(email: string): Promise<IOtp | null> {
    return await Otp.findOne({
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }); // Get the most recent OTP
  }

  async findByEmailAndOtp(email: string, otp: number): Promise<IOtp | null> {
    return await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      isUsed: false
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await Otp.findByIdAndUpdate(id, { isUsed: true });
  }

  async deleteOtpForEmail(email: string): Promise<void> {
    await Otp.deleteMany({ email: email.toLowerCase() });
  }

  async updateOtp(email: string, otp: number, expiresAt: Date): Promise<void> {
    await Otp.updateOne(
      { email: email.toLowerCase(), isUsed: false },
      {
        otp: otp,
        expiresAt: expiresAt,
        updatedAt: new Date()
      }
    );
  }

  async deleteExpired(): Promise<void> {
    await Otp.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }

  async getUserData(email: string): Promise<{ name: string; email: string; password: string; phone?: string } | null> {
    const otp = await Otp.findOne({
      email: email.toLowerCase()
    }).sort({ createdAt: -1 });

    return otp?.userData || null;
  }
}
