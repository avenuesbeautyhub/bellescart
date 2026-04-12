import { IOrder } from '../../models/Order';

export interface IOrderInteractor {
  createOrder(userId: string, orderData: {
    shippingAddress: IOrder['shippingAddress'];
    billingAddress?: IOrder['billingAddress'];
    paymentMethod: IOrder['paymentMethod'];
    notes?: string;
  }): Promise<IOrder>;
  getOrders(userId: string, filters?: {
    page?: number;
    limit?: number;
    status?: IOrder['status'];
  }): Promise<{ orders: IOrder[]; pagination: any }>;
  getOrderById(userId: string, orderId: string): Promise<IOrder | null>;
  updateOrderStatus(orderId: string, status: IOrder['status'], additionalData?: {
    trackingNumber?: string;
    estimatedDelivery?: Date;
  }): Promise<IOrder | null>;
  cancelOrder(userId: string, orderId: string): Promise<IOrder | null>;
  getOrderByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  getOrdersByStatus(status: IOrder['status'], options?: {
    page?: number;
    limit?: number;
  }): Promise<{ orders: IOrder[]; pagination: any }>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]>;
  getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number>;
  getOrderStats(): Promise<any>;
  getTopSellingProducts(limit?: number): Promise<any[]>;
  getMonthlyRevenue(year: number): Promise<any[]>;
  processRefund(orderId: string, refundData: {
    reason: string;
    amount?: number;
    items?: Array<{ productId: string; quantity: number }>;
  }): Promise<IOrder | null>;
  updateTrackingInfo(orderId: string, trackingData: {
    trackingNumber: string;
    estimatedDelivery?: Date;
  }): Promise<IOrder | null>;
  getUserOrderHistory(userId: string, options?: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ orders: IOrder[]; pagination: any }>;
}
