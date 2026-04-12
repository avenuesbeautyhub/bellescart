import { IOrderInteractor } from '../providers/interfaces/IOrderInteractor';
import { IOrderRepository } from '../providers/interfaces/IOrderRepository';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { Order, IOrder } from '../models/Order';
import { ICart } from '../models/Cart';

export class OrderInteractor implements IOrderInteractor {
  private _orderRepository: IOrderRepository;
  private _cartRepository: ICartRepository;
  private _productRepository: IProductRepository;

  constructor(
    orderRepository: IOrderRepository,
    cartRepository: ICartRepository,
    productRepository: IProductRepository
  ) {
    this._orderRepository = orderRepository;
    this._cartRepository = cartRepository;
    this._productRepository = productRepository;
  }

  async createOrder(userId: string, orderData: {
    shippingAddress: IOrder['shippingAddress'];
    billingAddress?: IOrder['billingAddress'];
    paymentMethod: IOrder['paymentMethod'];
    notes?: string;
  }): Promise<IOrder> {
    // Get user's cart
    const cart = await this._cartRepository.findByUserWithProducts(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = (cartItem.product as any);
      
      // Check stock
      if (product.inventory.trackQuantity && product.inventory.quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        variant: cartItem.variant,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.total
      });

      subtotal += cartItem.total;
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const discount = cart.couponDiscount || 0; // Apply coupon discount
    const total = subtotal + tax + shipping - discount;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      notes: orderData.notes
    });

    await order.save();

    // Update product inventory
    for (const cartItem of cart.items) {
      const product = (cartItem.product as any);
      if (product.inventory.trackQuantity) {
        await this._productRepository.updateInventory(
          product._id,
          -cartItem.quantity
        );
      }
    }

    // Clear cart
    await this._cartRepository.clearCart(userId);

    return await order.populate('items.product');
  }

  async getOrders(userId: string, filters: {
    page?: number;
    limit?: number;
    status?: IOrder['status'];
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10, status } = filters;

    let orders: IOrder[];
    let total: number;

    if (status) {
      orders = await this._orderRepository.getUserOrdersWithStatus(userId, status, {
        limit,
        skip: (page - 1) * limit
      });
      total = await this._orderRepository.count({ user: userId, status });
    } else {
      orders = await this._orderRepository.findByUser(userId, {
        limit,
        skip: (page - 1) * limit
      });
      total = await this._orderRepository.count({ user: userId });
    }

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<IOrder | null> {
    return this._orderRepository.findByIdWithUserAndPopulate(userId, orderId);
  }

  async updateOrderStatus(orderId: string, status: IOrder['status'], additionalData?: {
    trackingNumber?: string;
    estimatedDelivery?: Date;
  }): Promise<IOrder | null> {
    const updateData: any = { status };
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    return this._orderRepository.updateStatus(orderId, status, updateData);
  }

  async cancelOrder(userId: string, orderId: string): Promise<IOrder | null> {
    const order = await this._orderRepository.findByIdWithUserAndPopulate(userId, orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Restore inventory
    for (const item of order.items) {
      await this._productRepository.updateInventory(
        item.product.toString(),
        item.quantity
      );
    }

    // Update order status
    return this._orderRepository.updateStatus(orderId, 'cancelled');
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return this._orderRepository.findByOrderNumber(orderNumber);
  }

  async getOrdersByStatus(status: IOrder['status'], options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10 } = options;

    const orders = await this._orderRepository.findByStatus(status, {
      limit,
      skip: (page - 1) * limit
    });

    const total = await this._orderRepository.count({ status });

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]> {
    return this._orderRepository.getOrdersByDateRange(startDate, endDate);
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    return this._orderRepository.getRevenueByDateRange(startDate, endDate);
  }

  async getOrderStats(): Promise<any> {
    return this._orderRepository.getOrderStats();
  }

  async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    return this._orderRepository.getTopSellingProducts(limit);
  }

  async getMonthlyRevenue(year: number): Promise<any[]> {
    return this._orderRepository.getMonthlyRevenue(year);
  }

  async processRefund(orderId: string, refundData: {
    reason: string;
    amount?: number;
    items?: Array<{ productId: string; quantity: number }>;
  }): Promise<IOrder | null> {
    const order = await this._orderRepository.findByIdWithPopulate(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be refunded
    if (!['delivered', 'shipped'].includes(order.status)) {
      throw new Error('Order cannot be refunded at this stage');
    }

    // Restore inventory for refunded items
    if (refundData.items) {
      for (const item of refundData.items) {
        await this._productRepository.updateInventory(item.productId, item.quantity);
      }
    }

    // Update order status
    const updateData = {
      status: 'refunded' as const,
      paymentStatus: 'refunded' as const
    };

    return this._orderRepository.updateStatus(orderId, 'refunded', updateData);
  }

  async updateTrackingInfo(orderId: string, trackingData: {
    trackingNumber: string;
    estimatedDelivery?: Date;
  }): Promise<IOrder | null> {
    return this._orderRepository.updateStatus(orderId, 'shipped', {
      trackingNumber: trackingData.trackingNumber,
      estimatedDelivery: trackingData.estimatedDelivery
    });
  }

  async getUserOrderHistory(userId: string, options: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ orders: IOrder[]; pagination: any }> {
    const { page = 1, limit = 10, startDate, endDate } = options;

    const query: any = { user: userId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    // Use base repository find method
    const orders = await this._orderRepository.find(query, {
      limit,
      skip: (page - 1) * limit,
      sort: { createdAt: -1 }
    });

    const total = await this._orderRepository.count(query);

    return {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }
}
