import { IOrderRepository } from '@/repositories/orderRepository';
import { ICartRepository } from '@/repositories/cartRepository';
import { IProductRepository } from '@/repositories/productRepository';
import { IOrder } from '@/entities/orderEntity';
import { ERROR_CODES } from '@/constants/errorCodes';

export interface ICreateOrderRequest {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod?: string;
}

export interface IOrderService {
  createOrder(userId: string, orderData: ICreateOrderRequest): Promise<any>;
  getOrderById(orderId: string, userId?: string): Promise<any>;
  getUserOrders(userId: string, page?: number, limit?: number): Promise<{ orders: any[]; pagination: any }>;
  updateOrderStatus(orderId: string, status: IOrder['status']): Promise<any>;
  cancelOrder(orderId: string, userId: string): Promise<any>;
  getAllOrders(page?: number, limit?: number): Promise<{ orders: any[]; pagination: any }>;
}

export class OrderService implements IOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository
  ) {}

  async createOrder(userId: string, orderData: ICreateOrderRequest): Promise<any> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error(ERROR_CODES.CART_EMPTY);
    }

    for (const item of cart.items) {
      const product = await this.productRepository.findById(item.product.toString());
      if (!product || !product.inStock || product.stock < item.quantity) {
        throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
      }
    }

    const orderItems = cart.items.map(item => ({
      product: item.product.toString(),
      quantity: item.quantity,
      price: item.product.price,
      size: item.size,
      color: item.color
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = this.calculateDeliveryFee(totalAmount);
    const finalAmount = totalAmount + deliveryFee;

    const order = await this.orderRepository.create({
      user: userId,
      items: orderItems,
      totalAmount,
      deliveryFee,
      finalAmount,
      shippingAddress: {
        ...orderData.shippingAddress,
        country: orderData.shippingAddress.country || 'India'
      },
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    for (const item of cart.items) {
      await this.productRepository.updateStock(item.product.toString(), item.quantity);
    }

    await this.cartRepository.clearCart(userId);

    return order;
  }

  async getOrderById(orderId: string, userId?: string): Promise<any> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (userId && order.user.toString() !== userId) {
      throw new Error(ERROR_CODES.FORBIDDEN);
    }

    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10): Promise<{ orders: any[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const orders = await this.orderRepository.findByUserId(userId, limit, skip);
    const total = await this.orderRepository.countByUserId(userId);
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async updateOrderStatus(orderId: string, status: IOrder['status']): Promise<any> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    return this.orderRepository.updateStatus(orderId, status);
  }

  async cancelOrder(orderId: string, userId: string): Promise<any> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (order.user.toString() !== userId) {
      throw new Error(ERROR_CODES.FORBIDDEN);
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new Error(ERROR_CODES.INVALID_ORDER_STATUS);
    }

    for (const item of order.items) {
      await this.productRepository.updateStock(item.product.toString(), -item.quantity);
    }

    return this.orderRepository.updateStatus(orderId, 'cancelled');
  }

  async getAllOrders(page = 1, limit = 10): Promise<{ orders: any[]; pagination: any }> {
    const skip = (page - 1) * limit;
    const orders = await this.orderRepository.findAll(limit, skip);
    const total = await this.orderRepository.count();
    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  private calculateDeliveryFee(totalAmount: number): number {
    if (totalAmount < 499) {
      return 40;
    } else if (totalAmount <= 1000) {
      return 20;
    } else {
      return 0;
    }
  }
}
