import { IAdmin, IUser } from '../../models/User';

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findById(id: string): Promise<IAdmin | null>;
  create(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<IAdmin>;
  registerAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<IAdmin>;
  updateProfile(id: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  }): Promise<IAdmin | null>;
  updateLastLogin(id: string): Promise<void>;
  updateStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void>;
  delete(id: string): Promise<void>;
  getAllUsers(): Promise<Partial<IUser>[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
  }>;
}
