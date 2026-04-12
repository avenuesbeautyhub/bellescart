import { Response, NextFunction, Request } from 'express';
import { ICartInteractor } from '../providers/interfaces/ICartInteractor';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  private _cartInteractor: ICartInteractor;

  constructor(cartInteractor: ICartInteractor) {
    this._cartInteractor = cartInteractor;
  }

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const cart = await this._cartInteractor.getCart(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { productId, variant, quantity } = req.body;

      const cart = await this._cartInteractor.addToCart(authReq.user._id.toString(), {
        productId,
        variant,
        quantity
      });

      res.status(200).json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await this._cartInteractor.updateCartItem(authReq.user._id.toString(), itemId, quantity);

      res.status(200).json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { itemId } = req.params;

      const cart = await this._cartInteractor.removeFromCart(authReq.user._id.toString(), itemId);

      res.status(200).json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const cart = await this._cartInteractor.clearCart(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  };
}
