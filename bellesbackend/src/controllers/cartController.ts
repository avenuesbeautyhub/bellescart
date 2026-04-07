import { Request, Response } from 'express';
import { IAddToCartInteractor } from '@/interactors/cart/addToCartInteractor';
import { BaseResponse } from '@/responses/baseResponse';
import { HTTP_STATUS_CODES } from '@/constants/statusCodes';
import { IAuthenticatedRequest } from '@/middleware/authMiddleware';

export class CartController {
  constructor(
    private addToCartInteractor: IAddToCartInteractor,
    private cartService: any
  ) {}

  async getCart(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await this.cartService.getCart(userId);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Cart retrieved successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async addToCart(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId, quantity, size, color } = req.body;

      const result = await this.addToCartInteractor.execute(userId, productId, quantity, size, color);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Item added to cart successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateCartItem(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;
      const { quantity } = req.body;

      const result = await this.cartService.updateCartItem(userId, productId, quantity);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Cart item updated successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async removeFromCart(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      const result = await this.cartService.removeFromCart(userId, productId);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Item removed from cart successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async clearCart(req: IAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await this.cartService.clearCart(userId);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Cart cleared successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }
}
