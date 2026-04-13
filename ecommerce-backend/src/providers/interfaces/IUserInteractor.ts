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
    addresses?: IUser['addresses'];
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
  addAddress(userId: string, address: IUser['addresses'][0]): Promise<void>;
  updateAddress(userId: string, addressIndex: number, address: Partial<IUser['addresses'][0]>): Promise<void>;
  removeAddress(userId: string, addressIndex: number): Promise<void>;
  setDefaultAddress(userId: string, addressIndex: number): Promise<void>;
}
