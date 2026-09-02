import { Response, NextFunction, Request } from 'express';
import { IOrderInteractor } from '../providers/interfaces/IOrderInteractor';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { AuthRequest } from '../middleware/auth';
import { nimbusPostService } from '../services/nimbusPost.service';

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
        processNimbus,
        nimbusCourierId,
        calculatedShippingFee
      } = req.body;

      console.log('📦 Request body received:', {
        processNimbus,
        nimbusCourierId,
        calculatedShippingFee,
        paymentMethod
      });

      const order = await this._orderInteractor.createOrder(authReq.user._id.toString(), {
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes,
        processNimbus,
        nimbusCourierId,
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

  // NimbusPost Integration Methods

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

      const result = await nimbusPostService.checkServiceability(delivery_postcode, totalWeight, cod || totalAmount);

      if (!result.success) {
        // Calculate dynamic shipping fee based on subtotal
        let shippingRate = 60; // Default for orders < ₹250
        if (totalAmount >= 999) {
          shippingRate = 0; // Free shipping
        } else if (totalAmount > 499) {
          shippingRate = 40; // ₹40 shipping
        }

        // If courier service is disabled, return default shipping rates
        res.status(200).json({
          success: true,
          data: {
            rates: [
              {
                courier_id: 'standard',
                courier_name: 'Standard Delivery',
                estimated_delivery_days: '3-5',
                rate: shippingRate,
                cod: true,
                cod_charges: cod > 0 ? 50 : 0,
                availability: {
                  blocked: 0,
                  suppressDate: null,
                  cutoffTime: null,
                  pickupAvailability: '1',
                  secondsLeftForPickup: 86400
                }
              }
            ],
            totalWeight,
            totalAmount,
            message: 'Courier service disabled - using dynamic rates'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          rates: result.couriers,
          totalWeight,
          totalAmount
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
          error: 'Tracking ID is required'
        });
        return;
      }

      const result = await nimbusPostService.trackShipment(awb);

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

      if (!order.nimbus?.trackingId) {
        res.status(400).json({
          success: false,
          error: 'Order does not have NimbusPost tracking information'
        });
        return;
      }

      const result = await nimbusPostService.trackShipment(order.nimbus.trackingId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }

      // Update order with latest tracking status
      await this._orderInteractor.updateOrderStatus(order._id.toString(), order.status, {
        nimbus: {
          ...order.nimbus,
          shipmentStatus: result.trackingData?.currentStatus,
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

  retryNimbusIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const result = await this._orderInteractor.retryNimbusIntegration(orderId, courierId);

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
}
