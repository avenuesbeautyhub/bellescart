import { Response, NextFunction, Request } from 'express';
import { IPrivacyInteractor } from '../providers/interfaces/IPrivacyInteractor';
import { AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const logger = createLogger('PrivacyController');

export class PrivacyController {
  private _privacyInteractor: IPrivacyInteractor;

  constructor(privacyInteractor: IPrivacyInteractor) {
    this._privacyInteractor = privacyInteractor;
  }

  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const preferences = await this._privacyInteractor.getPreferences(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      logger.error('Error getting privacy preferences', { error });
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { marketingEmails } = req.body;

      // Validate input
      if (typeof marketingEmails !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Invalid marketingEmails value. Must be a boolean.'
        });
        return;
      }

      const preferences = await this._privacyInteractor.updatePreferences(
        authReq.user._id.toString(),
        { marketingEmails }
      );

      res.status(200).json({
        success: true,
        message: 'Privacy preferences updated successfully',
        data: preferences
      });
    } catch (error) {
      logger.error('Error updating privacy preferences', { error });
      next(error);
    }
  };

  requestDataExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const request = await this._privacyInteractor.requestDataExport(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        message: 'Data export request submitted successfully',
        data: request
      });
    } catch (error) {
      logger.error('Error requesting data export', { error });
      
      if (error instanceof Error && error.message === 'You already have a pending export request. Please wait for it to complete.') {
        res.status(409).json({
          success: false,
          error: error.message
        });
        return;
      }
      
      next(error);
    }
  };

  getUserRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const requests = await this._privacyInteractor.getUserRequests(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      logger.error('Error getting user privacy requests', { error });
      next(error);
    }
  };

  downloadExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { requestId } = req.params;

      if (!requestId) {
        res.status(400).json({
          success: false,
          error: 'Request ID is required'
        });
        return;
      }

      const exportData = await this._privacyInteractor.getExportData(
        authReq.user._id.toString(),
        requestId
      );

      res.status(200).json({
        success: true,
        data: exportData
      });
    } catch (error) {
      logger.error('Error downloading export data', { error });
      
      if (error instanceof Error) {
        if (error.message === 'Request not found') {
          res.status(404).json({
            success: false,
            error: error.message
          });
          return;
        }
        if (error.message === 'Export request is not completed yet') {
          res.status(400).json({
            success: false,
            error: error.message
          });
          return;
        }
      }
      
      next(error);
    }
  };
}
