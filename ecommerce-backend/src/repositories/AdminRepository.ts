import { IAdmin, IUser, User } from '../models/User';
import { Admin } from '../models/Admin';
import { IAdminRepository } from '../providers/interfaces/IAdminRepository';

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email: email.toLowerCase(), role: 'admin' });
  }

  async findById(id: string): Promise<IAdmin | null> {
    return await Admin.findById(id);
  }

  async create(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<IAdmin> {
    const admin = new Admin({
      ...adminData,
      email: adminData.email.toLowerCase(),
      role: 'admin',
      permissions: ['users', 'products', 'orders', 'analytics', 'settings'],
      isActive: true
    });

    return await admin.save();
  }

  async registerAdmin(adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<IAdmin> {
    // Check if admin already exists
    const existingAdmin = await this.findByEmail(adminData.email);
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    // Create new admin
    return await this.create(adminData);
  }

  async updateProfile(id: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    permissions?: string[];
  }): Promise<IAdmin | null> {
    const updateFields: any = {};

    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.email !== undefined) updateFields.email = updateData.email.toLowerCase();
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.permissions !== undefined) updateFields.permissions = updateData.permissions;

    updateFields.updatedAt = new Date();

    return await Admin.findByIdAndUpdate(id, updateFields, { new: true });
  }

  async updateLastLogin(id: string): Promise<void> {
    await Admin.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    await Admin.findByIdAndUpdate(id, {
      isActive: status === 'active',
      updatedAt: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    await Admin.findByIdAndDelete(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
  }> {
    // This would typically involve aggregating data from multiple collections
    // For now, returning mock data structure
    const totalUsers = await Admin.countDocuments({ role: 'admin' });
    const activeUsers = await Admin.countDocuments({ role: 'admin', isActive: true });

    // TODO: Implement actual order and revenue aggregation
    const totalOrders = 0; // Would aggregate from Order collection
    const totalRevenue = 0; // Would aggregate from Order collection

    return {
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue
    };
  }
}
