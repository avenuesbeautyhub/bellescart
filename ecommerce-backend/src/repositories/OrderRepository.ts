import { Order, IOrder } from '../models/Order';
import { BaseRepository } from './BaseRepository';
import { IOrderRepository } from '../providers/interfaces/IOrderRepository';

export class OrderRepository extends BaseRepository<IOrder> implements IOrderRepository {
  constructor() {
    super(Order);
  }

  async findByUser(userId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IOrder[]> {
    return this.find({ user: userId }, { ...options, sort: { createdAt: -1, ...options?.sort } });
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return this.findOne({ orderNumber });
  }

  async findByIdWithPopulate(id: string): Promise<IOrder | null> {
    return this.model.findById(id).populate('items.product');
  }

  async findByIdWithUserAndPopulate(userId: string, orderId: string): Promise<IOrder | null> {
    return this.model.findOne({
      _id: orderId,
      user: userId
    }).populate('items.product');
  }

  async findByStatus(status: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IOrder[]> {
    return this.find({ status }, options);
  }

  async updateStatus(orderId: string, status: IOrder['status'], additionalData?: any): Promise<IOrder | null> {
    const updateData: any = { status };

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    return this.update(orderId, updateData);
  }

  async getUserOrdersWithStatus(userId: string, status: IOrder['status'], options?: { limit?: number; skip?: number }): Promise<IOrder[]> {
    return this.find({ user: userId, status }, { ...options, sort: { createdAt: -1 } });
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]> {
    return this.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }, { sort: { createdAt: -1 } });
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const orders = await this.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      paymentStatus: 'paid'
    });

    return orders.reduce((total, order) => total + order.total, 0);
  }

  async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    const pipeline: any[] = [
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' }
    ];

    return this.model.aggregate(pipeline);
  }

  async getOrderStats(): Promise<any> {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };
  }

  async getMonthlyRevenue(year: number): Promise<any[]> {
    const pipeline: any[] = [
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31)
          },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return this.model.aggregate(pipeline);
  }
}
