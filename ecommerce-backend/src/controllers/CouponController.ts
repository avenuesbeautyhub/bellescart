import { Request, Response, NextFunction } from 'express';
import { ICouponInteractor } from '../providers/interfaces/ICouponInteractor';
import { ICoupon } from '../models/Coupon';

export class CouponController {
  private _couponInteractor: ICouponInteractor;

  constructor(couponInteractor: ICouponInteractor) {
    this._couponInteractor = couponInteractor;
  }

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const couponData = req.body;
      const coupon = await this._couponInteractor.createCoupon(couponData);
      
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: { coupon }
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getAllCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await this._couponInteractor.getAllCoupons();
      
      res.status(200).json({
        success: true,
        message: 'Coupons retrieved successfully',
        data: { coupons }
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getCouponById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await this._couponInteractor.getCouponById(id);
      
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Coupon retrieved successfully',
        data: { coupon }
      });
    } catch (error: any) {
      return next(error);
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const coupon = await this._couponInteractor.updateCoupon(id, updateData);
      
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: { coupon }
      });
    } catch (error: any) {
      return next(error);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const coupon = await this._couponInteractor.deleteCoupon(id);
      
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
        data: { coupon }
      });
    } catch (error: any) {
      return next(error);
    }
  }

  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const { cartTotal, cartCategory } = req.body;
      const userId = (req as any).user?.id; // Get user ID from auth middleware if available
      
      const validation = await this._couponInteractor.validateCoupon(
        code, 
        userId, 
        cartTotal, 
        cartCategory
      );
      
      return res.status(200).json({
        success: validation.valid,
        message: validation.valid ? 'Coupon is valid' : validation.error,
        data: validation
      });
    } catch (error: any) {
      return next(error);
    }
  }

  async applyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const { cartTotal, cartCategory } = req.body;
      const userId = (req as any).user?.id; // Get user ID from auth middleware
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      
      const result = await this._couponInteractor.applyCoupon(
        code, 
        userId, 
        cartTotal, 
        cartCategory
      );
      
      return res.status(200).json({
        success: result.success,
        message: result.success ? 'Coupon applied successfully' : result.error,
        data: result
      });
    } catch (error: any) {
      return next(error);
    }
  }
}