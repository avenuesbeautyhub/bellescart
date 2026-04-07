import { Request, Response } from 'express';
import { ICreateOrderInteractor } from '@/interactors/order/createOrderInteractor';
import { BaseResponse } from '@/responses/baseResponse';
import { HTTP_STATUS_CODES } from '@/constants/statusCodes';
import { IAuthenticatedRequest } from '@/middleware/authMiddleware';
import { ICreateOrderRequest } from '@/services/orderService';

export class OrderController {
  constructor(
    private createOrderInteractor: ICreateOrderInteractor,
    private orderService: any
  ) {}

  async createOrder(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orderData: ICreateOrderRequest = req.body;

      const result = await this.createOrderInteractor.execute(userId, orderData);
      
      res.status(HTTP_STATUS_CODES.CREATED).json(
        BaseResponse.success('Order created successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getOrderById(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const result = await this.orderService.getOrderById(id, userRole === 'admin' ? undefined : userId);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Order retrieved successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getUserOrders(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.orderService.getUserOrders(userId, page, limit);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Orders retrieved successfully', result.orders, result.pagination)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getAllOrders(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.orderService.getAllOrders(page, limit);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('All orders retrieved successfully', result.orders, result.pagination)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateOrderStatus(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await this.orderService.updateOrderStatus(id, status);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Order status updated successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async cancelOrder(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const result = await this.orderService.cancelOrder(id, userId);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Order cancelled successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }
}
