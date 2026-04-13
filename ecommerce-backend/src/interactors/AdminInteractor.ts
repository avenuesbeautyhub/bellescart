import { IAdminInteractor } from '../providers/interfaces/IAdminInteractor';
import { IAdminRepository } from '../providers/interfaces/IAdminRepository';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { IAdmin, IUser } from '../models/User';

export class AdminInteractor implements IAdminInteractor {
  private _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this._adminRepository = adminRepository;
  }

  async adminLogin(credentials: {
    email: string;
    password: string;
  }): Promise<{ admin: Partial<IAdmin>; token: string; refreshToken: string }> {
    // Find admin with password
    const admin = await this._adminRepository.findByEmail(credentials.email);
    if (!admin) {
      throw new Error(`Invalid admin credentials for ${credentials.email}`);
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new Error(`Invalid password for admin ${credentials.email}`);
    }

    // Update last login
    await this._adminRepository.updateLastLogin(admin._id.toString());

    // Generate tokens
    const token = generateToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Return admin data without sensitive information
    const adminResponse = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      phone: admin.phone,
      permissions: admin.permissions
    };

    return { admin: adminResponse, token, refreshToken };
  }

  async registerAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    registrationKey: string;
  }): Promise<{ admin: Partial<IAdmin>; message: string }> {
    // Validate registration key - this is business logic that belongs in interactor



    const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || 'bellescart-admin-2024';

    console.log('admin reg key', ADMIN_REGISTRATION_KEY);

    if (adminData.registrationKey !== ADMIN_REGISTRATION_KEY) {
      throw new Error('Invalid registration key');
    }

    // Delegate admin creation (including duplicate check) to repository
    const newAdmin = await this._adminRepository.registerAdmin({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      phone: adminData.phone
    });

    // Return admin data without sensitive information
    const adminResponse = {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      avatar: newAdmin.avatar,
      phone: newAdmin.phone,
      permissions: newAdmin.permissions,
      isActive: newAdmin.isActive
    };

    return { admin: adminResponse, message: 'Admin registered successfully' };
  }

  async getAdminProfile(adminId: string): Promise<Partial<IAdmin> | null> {
    const admin = await this._adminRepository.findById(adminId);
    if (!admin) return null;

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      phone: admin.phone,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive
    };
  }

  async updateAdminProfile(adminId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<Partial<IAdmin> | null> {
    const admin = await this._adminRepository.updateProfile(adminId, updateData);
    if (!admin) return null;

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      phone: admin.phone,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive
    };
  }

  async changeAdminPassword(adminId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const admin = await this._adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password - this would require updating the Admin model directly
    // For now, this is a placeholder implementation
    console.log(`Password change requested for admin ${adminId}`);
  }

  async getAllUsers(): Promise<Partial<IUser>[]> {
    const users = await this._adminRepository.getAllUsers();
    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    }));
  }

  async getUserById(userId: string): Promise<Partial<IUser> | null> {
    // This would typically query the User collection, not Admin collection
    // For now, returning null as placeholder
    return null;
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    // This would update the User collection, not Admin collection
    // For now, this is a placeholder implementation
    console.log(`Updating user ${userId} status to ${status}`);
  }

  async deleteUser(userId: string): Promise<void> {
    // This would delete from User collection, not Admin collection
    // For now, this is a placeholder implementation
    console.log(`Deleting user ${userId}`);
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
  }> {
    return await this._adminRepository.getAdminStats();
  }
}
