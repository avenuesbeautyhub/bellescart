import { IOrderService, ICreateOrderRequest } from '@/services/orderService';

export interface ICreateOrderInteractor {
  execute(userId: string, orderData: ICreateOrderRequest): Promise<any>;
}

export class CreateOrderInteractor implements ICreateOrderInteractor {
  constructor(private orderService: IOrderService) {}

  async execute(userId: string, orderData: ICreateOrderRequest): Promise<any> {
    return this.orderService.createOrder(userId, orderData);
  }
}
