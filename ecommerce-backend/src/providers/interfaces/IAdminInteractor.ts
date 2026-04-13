import { IAdmin, IUser } from '../../models/User';

export interface IAdminInteractor {
  adminLogin(credentials: {
    email: string;
    password: string;
  }): Promise<{ admin: Partial<IAdmin>; token: string; refreshToken: string }>;
  registerAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    registrationKey: string;
  }): Promise<{ admin: Partial<IAdmin>; message: string }>;
  getAdminProfile(adminId: string): Promise<Partial<IAdmin> | null>;
  updateAdminProfile(adminId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  }): Promise<Partial<IAdmin> | null>;
  changeAdminPassword(adminId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  getAllUsers(): Promise<Partial<IUser>[]>;
  getUserById(userId: string): Promise<Partial<IUser> | null>;
  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
  }>;
}
