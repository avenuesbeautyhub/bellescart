import { Request, Response, NextFunction } from 'express';
import { IWalletInteractor } from '../providers/interfaces/IWalletInteractor';
import { AuthRequest } from '../middleware/auth';

export class WalletController {
  private _walletInteractor: IWalletInteractor;

  constructor(walletInteractor: IWalletInteractor) {
    this._walletInteractor = walletInteractor;
  }

  getWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const wallet = await this._walletInteractor.getWalletByUser(authReq.user.id);
      
      if (!wallet) {
        const newWallet = await this._walletInteractor.createWalletForUser(authReq.user.id);
        res.status(200).json({
          success: true,
          data: { wallet: newWallet }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  };

  getWalletBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const balance = await this._walletInteractor.getWalletBalance(authReq.user.id);

      res.status(200).json({
        success: true,
        data: { balance }
      });
    } catch (error) {
      next(error);
    }
  };

  creditWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { amount, description, orderId } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
        return;
      }

      if (!description) {
        res.status(400).json({
          success: false,
          message: 'Description is required'
        });
        return;
      }

      const wallet = await this._walletInteractor.creditWallet(
        authReq.user.id,
        amount,
        description,
        orderId
      );

      res.status(200).json({
        success: true,
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  };

  debitWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { amount, description, orderId } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
        return;
      }

      if (!description) {
        res.status(400).json({
          success: false,
          message: 'Description is required'
        });
        return;
      }

      const wallet = await this._walletInteractor.debitWallet(
        authReq.user.id,
        amount,
        description,
        orderId
      );

      res.status(200).json({
        success: true,
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  };
}