import { IOrder, Order } from '@/entities/orderEntity';

export interface IOrderRepository {
  create(orderData: Partial<IOrder>): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByUserId(userId: string, limit?: number, skip?: number): Promise<IOrder[]>;
  updateById(id: string, updateData: Partial<IOrder>): Promise<IOrder | null>;
  updateStatus(id: string, status: IOrder['status']): Promise<IOrder | null>;
  findAll(limit?: number, skip?: number): Promise<IOrder[]>;
  count(): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}

export class OrderRepository implements IOrderRepository {
  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(orderData);
    const savedOrder = await order.save();
    return Order.findById(savedOrder._id)
      .populate('user', 'name email')
      .populate('items.product')
      .exec() as Promise<IOrder>;
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product');
  }

  async findByUserId(userId: string, limit = 10, skip = 0): Promise<IOrder[]> {
    return Order.find({ user: userId })
      .populate('items.product')
      .sort({ orderDate: -1 })
      .limit(limit)
      .skip(skip);
  }

  async updateById(id: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('items.product');
  }

  async updateStatus(id: string, status: IOrder['status']): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('items.product');
  }

  async findAll(limit = 10, skip = 0): Promise<IOrder[]> {
    return Order.find({})
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ orderDate: -1 })
      .limit(limit)
      .skip(skip);
  }

  async count(): Promise<number> {
    return Order.countDocuments();
  }

  async countByUserId(userId: string): Promise<number> {
    return Order.countDocuments({ user: userId });
  }
}
