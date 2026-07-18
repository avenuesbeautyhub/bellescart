import { Response, NextFunction, Request } from 'express';
import { IOrderInteractor } from '../providers/interfaces/IOrderInteractor';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { AuthRequest } from '../middleware/auth';
import { shiprocketService } from '../services/shiprocket.service';

export class OrderController {
  private _orderInteractor: IOrderInteractor;
  private _cartRepository: ICartRepository;

  constructor(orderInteractor: IOrderInteractor, cartRepository: ICartRepository) {
    this._orderInteractor = orderInteractor;
    this._cartRepository = cartRepository;
  }

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🎯 createOrder endpoint called');
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
        notes,
        processShiprocket,
        shiprocketCourierId,
        calculatedShippingFee
      } = req.body;

      console.log('📦 Request body received:', {
        processShiprocket,
        shiprocketCourierId,
        calculatedShippingFee,
        paymentMethod
      });

      const order = await this._orderInteractor.createOrder(authReq.user._id.toString(), {
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
        processShiprocket,
        shiprocketCourierId,
        calculatedShippingFee
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

  // Shiprocket Integration Methods

  calculateShipping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { delivery_postcode, cod } = req.body;

      if (!delivery_postcode) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: delivery_postcode'
        });
        return;
      }

      // Get user's cart to calculate total weight
      const cart = await this._cartRepository.findByUserWithProducts(authReq.user._id.toString());
      if (!cart || cart.items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Cart is empty. Please add items to cart first.'
        });
        return;
      }

      // Calculate total weight from cart items
      let totalWeight = 0;
      let totalAmount = 0;

      for (const cartItem of cart.items) {
        const product = (cartItem.product as any);
        const defaultWeight = parseFloat(process.env.DEFAULT_PRODUCT_WEIGHT || '0.070');
        const itemWeight = (product.weight || defaultWeight) * cartItem.quantity;
        totalWeight += itemWeight;
        totalAmount += cartItem.total;
      }

      const pickup_postcode = process.env.SHIPROCKET_PICKUP_PINCODE || '691305';

      const result = await shiprocketService.calculateShipping({
        pickup_postcode,
        delivery_postcode,
        weight: totalWeight,
        cod: cod || totalAmount,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to calculate shipping rates. Please configure Shiprocket credentials.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          rates: result.rates,
          totalWeight,
          totalAmount
        }
      });
    } catch (error) {
      next(error);
    }
  };

  processShiprocketOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { orderId, orderData, shippingRequest, courierId } = req.body;

      if (!orderId || !orderData || !courierId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: orderId, orderData, courierId'
        });
        return;
      }

      // Process complete Shiprocket flow
      const result = await shiprocketService.processOrderCompleteFlow(
        orderData,
        shippingRequest || {},
        courierId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      // Update order with Shiprocket details
      const updatedOrder = await this._orderInteractor.updateOrderStatus(orderId, 'processing', {
        shiprocket: {
          orderId: result.shiprocketOrderId,
          shipmentId: result.shipmentId,
          awb: result.awb,
          courier: result.courier,
          trackingStatus: 'Processing',
        },
        trackingNumber: result.awb,
      });

      res.status(200).json({
        success: true,
        message: 'Shiprocket order processed successfully',
        data: {
          shiprocketOrderId: result.shiprocketOrderId,
          shipmentId: result.shipmentId,
          awb: result.awb,
          courier: result.courier,
          order: updatedOrder,
        }
      });
    } catch (error) {
      next(error);
    }
  };

  trackOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { awb } = req.params;

      if (!awb) {
        res.status(400).json({
          success: false,
          error: 'AWB number is required'
        });
        return;
      }

      const result = await shiprocketService.trackOrder(awb);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.trackingData
      });
    } catch (error) {
      next(error);
    }
  };

  trackOrderByOrderId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      if (!order.shiprocket?.awb) {
        res.status(400).json({
          success: false,
          error: 'Order does not have Shiprocket tracking information'
        });
        return;
      }

      const result = await shiprocketService.trackOrder(order.shiprocket.awb);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      // Update order with latest tracking status
      await this._orderInteractor.updateOrderStatus(order._id.toString(), order.status, {
        shiprocket: {
          ...order.shiprocket,
          trackingStatus: result.trackingData?.currentStatus,
        },
      });

      res.status(200).json({
        success: true,
        data: result.trackingData
      });
    } catch (error) {
      next(error);
    }
  };

  retryShiprocketIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { courierId } = req.body;

      if (!courierId) {
        res.status(400).json({
          success: false,
          error: 'courierId is required'
        });
        return;
      }

      const result = await this._orderInteractor.retryShiprocketIntegration(orderId, courierId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getPickupLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await shiprocketService.getPickupLocations();

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          locations: result.locations,
          configured: process.env.SHIPROCKET_PICKUP_LOCATION || 'Home'
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
