import { IUser } from '../../models/User';

export interface IUserInteractor {
  register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: Partial<IUser> }>;
  login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }>;
  refreshToken(refreshToken: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }>;
  getProfile(userId: string): Promise<Partial<IUser> | null>;
  updateProfile(userId: string, updateData: {
    name?: string;
    phone?: string;
    addresses?: any[];
    avatar?: string;
  }): Promise<Partial<IUser> | null>;
  changePassword(userId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  findByEmail(email: string): Promise<Partial<IUser> | null>;
  sendOtp(email: string, userData?: { name: string; email: string; password: string; phone?: string }): Promise<{ message: string }>;
  resendOtp(email: string): Promise<{ message: string }>;
  verifyOtp(email: string, otp: number): Promise<{ isValid: boolean; isExpired?: boolean; isInvalid?: boolean }>;
  completeRegistration(email: string): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }>;
  addToWishlist(userId: string, productId: string): Promise<void>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  getWishlist(userId: string): Promise<Partial<IUser> | null>;
  addAddress(userId: string, address: any): Promise<Partial<IUser> | null>;
  updateAddress(userId: string, addressId: string, address: any): Promise<Partial<IUser> | null>;
  removeAddress(userId: string, addressId: string): Promise<Partial<IUser> | null>;
  setDefaultAddress(userId: string, addressId: string): Promise<Partial<IUser> | null>;
}
