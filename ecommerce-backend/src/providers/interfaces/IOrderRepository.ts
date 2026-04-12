import { IOrder } from '../../models/Order';

export interface IOrderRepository {
  create(data: Partial<IOrder>): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByIdWithPopulate(id: string): Promise<IOrder | null>;
  findByIdWithUserAndPopulate(userId: string, orderId: string): Promise<IOrder | null>;
  find(filter: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<IOrder[]>;
  findByUser(userId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IOrder[]>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByStatus(status: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IOrder[]>;
  getUserOrdersWithStatus(userId: string, status: IOrder['status'], options?: { limit?: number; skip?: number }): Promise<IOrder[]>;
  updateStatus(orderId: string, status: IOrder['status'], additionalData?: any): Promise<IOrder | null>;
  update(id: string, data: Partial<IOrder>): Promise<IOrder | null>;
  delete(id: string): Promise<IOrder | null>;
  count(filter: any): Promise<number>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<IOrder[]>;
  getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number>;
  getTopSellingProducts(limit?: number): Promise<any[]>;
  getOrderStats(): Promise<any>;
  getMonthlyRevenue(year: number): Promise<any[]>;
}
