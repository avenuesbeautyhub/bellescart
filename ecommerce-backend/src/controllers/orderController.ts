import { Response, NextFunction, Request } from 'express';
import { IOrderInteractor } from '../providers/interfaces/IOrderInteractor';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  private _orderInteractor: IOrderInteractor;

  constructor(orderInteractor: IOrderInteractor) {
    this._orderInteractor = orderInteractor;
  }

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const {
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes
      } = req.body;

      const order = await this._orderInteractor.createOrder(authReq.user._id.toString(), {
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes
      });

      res.status(201).json({
        success: true,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  };

  getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { page = 1, limit = 10, status } = req.query;

      const result = await this._orderInteractor.getOrders(authReq.user._id.toString(), {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as any
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const order = await this._orderInteractor.getOrderById(authReq.user._id.toString(), req.params.id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, trackingNumber, estimatedDelivery } = req.body;

      const order = await this._orderInteractor.updateOrderStatus(req.params.id, status, {
        trackingNumber,
        estimatedDelivery
      });

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  };

  cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const order = await this._orderInteractor.cancelOrder(authReq.user._id.toString(), req.params.id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  };
}
