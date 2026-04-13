import { IUserInteractor } from '../providers/interfaces/IUserInteractor';
import { IUserRepository } from '../providers/interfaces/IUserRepository';
import { IOtpRepository } from '../providers/interfaces/IOtpRepository';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { IUser } from '../models/User';
import { sendOtpEmail } from '../utils/emailService';

export class UserInteractor implements IUserInteractor {
  private _userRepository: IUserRepository;
  private _otpRepository: IOtpRepository;

  constructor(userRepository: IUserRepository, otpRepository: IOtpRepository) {
    this._userRepository = userRepository;
    this._otpRepository = otpRepository;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: Partial<IUser> }> {
    // Check if user already exists
    const existingUser = await this._userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with this email id ${userData.email} already exists`);
    }

    // Create new user
    const user = await this._userRepository.create(userData);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data without sensitive information
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    return { user: userResponse };
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    // Find user with password
    const user = await this._userRepository.findByEmailWithPassword(credentials.email);
    if (!user) {
      throw new Error(`Invalid User ${credentials.email}`);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new Error(`Invalid password for user ${credentials.email}`);
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data without sensitive information
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    return { user: userResponse, token, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const decoded = verifyToken(refreshToken);

      // Find the user from the token
      const user = await this._userRepository.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Return user data without sensitive information
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      };

      return { user: userResponse, token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string): Promise<Partial<IUser> | null> {
    const user = await this._userRepository.getWishlist(userId);
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      addresses: user.addresses,
      wishlist: user.wishlist
    };
  }

  async updateProfile(userId: string, updateData: {
    name?: string;
    phone?: string;
    addresses?: IUser['addresses'];
  }): Promise<Partial<IUser> | null> {
    const user = await this._userRepository.updateProfile(userId, updateData);
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      addresses: user.addresses
    };
  }

  async changePassword(userId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userWithPassword = await this._userRepository.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    userWithPassword.password = passwordData.newPassword;
    await userWithPassword.save();
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    await this._userRepository.addToWishlist(userId, productId);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await this._userRepository.removeFromWishlist(userId, productId);
  }

  async addAddress(userId: string, address: IUser['addresses'][0]): Promise<void> {
    await this._userRepository.addAddress(userId, address);
  }

  async updateAddress(userId: string, addressIndex: number, address: Partial<IUser['addresses'][0]>): Promise<void> {
    await this._userRepository.updateAddress(userId, addressIndex, address);
  }

  async removeAddress(userId: string, addressIndex: number): Promise<void> {
    await this._userRepository.removeAddress(userId, addressIndex);
  }

  async setDefaultAddress(userId: string, addressIndex: number): Promise<void> {
    await this._userRepository.setDefaultAddress(userId, addressIndex);
  }

  async findByEmail(email: string): Promise<Partial<IUser> | null> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };
  }

  async sendOtp(email: string, userData?: { name: string; email: string; password: string; phone?: string }): Promise<{ message: string }> {
    // Check if user already exists
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error(`User with this email id ${email} already exists`);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP with user data
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry
    await this._otpRepository.create(email, otp, expiresAt, userData);

    // Send OTP email
    const sendmail = await sendOtpEmail(email, otp);
    console.log('otp sent', otp);
    console.log('mail sent', sendmail);

    return { message: 'OTP sent successfully' };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    // Check if there's an existing OTP for this email
    const existingOtp = await this._otpRepository.findByEmail(email);

    if (!existingOtp) {
      throw new Error('No OTP request found for this email. Please start the registration process again.');
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry

    // Update existing OTP with new code and expiration
    await this._otpRepository.updateOtp(email, newOtp, expiresAt);

    // Send new OTP email
    const sendmail = await sendOtpEmail(email, newOtp);
    console.log('otp resent', newOtp);
    console.log('mail sent', sendmail);

    return { message: 'OTP resent successfully' };
  }

  async verifyOtp(email: string, otp: number): Promise<{ isValid: boolean; isExpired: boolean; isInvalid: boolean }> {
    // Find the OTP by email and OTP code
    const storedOtp = await this._otpRepository.findByEmailAndOtp(email, otp);

    if (!storedOtp) {
      // No OTP found - could be wrong code or never existed
      return { isValid: false, isExpired: false, isInvalid: true };
    }

    // Check if OTP is expired by comparing current time with stored expiration time
    const currentTime = new Date();
    if (currentTime > storedOtp.expiresAt) {
      return { isValid: false, isExpired: true, isInvalid: false };
    }

    // Check if OTP is already used
    if (storedOtp.isUsed) {
      return { isValid: false, isExpired: false, isInvalid: true };
    }

    // Mark OTP as used
    await this._otpRepository.markAsUsed(storedOtp._id.toString());

    return { isValid: true, isExpired: false, isInvalid: false };
  }

  async completeRegistration(email: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
    // Get stored user data from OTP
    const userData = await this._otpRepository.getUserData(email);
    if (!userData) {
      throw new Error('User data not found. Please restart the registration process.');
    }

    // Create new user
    const user = await this._userRepository.create(userData);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Clean up OTP after successful registration
    await this._otpRepository.deleteOtpForEmail(email);

    // Return user data without sensitive information
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    return { user: userResponse, token, refreshToken };
  }
}
