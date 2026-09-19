import { IAdmin, IUser, User } from '../models/User';
import { Admin } from '../models/Admin';
import { IAdminRepository } from '../providers/interfaces/IAdminRepository';
import { Order } from '../models/Order';

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');
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

  async findAllUsers(filter?: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<IUser[]> {
    return await this.findWithFilter(filter, options);
  }

  private async findWithFilter(filter?: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<IUser[]> {
    const query = User.find(filter || {});

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.skip) {
      query.skip(options.skip);
    }

    if (options?.sort) {
      query.sort(options.sort);
    }

    return await query.exec();
  }

  async getAllUsers(): Promise<Partial<IUser>[]> {
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders?: number;
    processingOrders?: number;
    shippedOrders?: number;
    deliveredOrders?: number;
    cancelledOrders?: number;
    todayOrders?: number;
    todayRevenue?: number;
    thisMonthOrders?: number;
    thisMonthRevenue?: number;
    averageOrderValue?: number;
  }> {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Order status breakdown
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    // This month's statistics
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    const thisMonthRevenueResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: thisMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      todayRevenue,
      thisMonthOrders,
      thisMonthRevenue,
      averageOrderValue
    };
  }
}
