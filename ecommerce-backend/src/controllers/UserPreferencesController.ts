import { Response, NextFunction, Request } from 'express';
import { IUserPreferencesInteractor } from '../providers/interfaces/IUserPreferencesInteractor';
import { AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserPreferencesController');

export class UserPreferencesController {
  private _preferencesInteractor: IUserPreferencesInteractor;

  constructor(preferencesInteractor: IUserPreferencesInteractor) {
    this._preferencesInteractor = preferencesInteractor;
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

      const preferences = await this._preferencesInteractor.getPreferences(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('PUT /preferences request received');
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        logger.error('User not authenticated in updatePreferences');
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { language, theme, notifications, privacy, accessibility } = req.body;
      logger.info('Request body:', { language, theme, notifications, privacy, accessibility });

      // Validate language if provided
      if (language !== undefined) {
        const validLanguages = ['en', 'hi', 'ml'];
        if (!validLanguages.includes(language)) {
          res.status(400).json({
            success: false,
            error: 'Invalid language. Supported languages: ' + validLanguages.join(', ')
          });
          return;
        }
      }

      // Validate theme if provided
      if (theme !== undefined) {
        const validThemes = ['light', 'dark', 'auto'];
        if (!validThemes.includes(theme)) {
          res.status(400).json({
            success: false,
            error: 'Invalid theme. Supported themes: ' + validThemes.join(', ')
          });
          return;
        }
      }

      logger.info('Calling updatePreferences for user:', authReq.user._id.toString());
      const preferences = await this._preferencesInteractor.updatePreferences(
        authReq.user._id.toString(),
        {
          language,
          theme,
          notifications,
          privacy,
          accessibility
        }
      );

      logger.info('Preferences updated successfully, returning:', preferences);
      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences
      });
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      next(error);
    }
  };

  resetPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const preferences = await this._preferencesInteractor.resetPreferences(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        message: 'Preferences reset to default successfully',
        data: preferences
      });
    } catch (error) {
      logger.error('Error resetting user preferences:', error);
      next(error);
    }
  };

  deletePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      await this._preferencesInteractor.deletePreferences(authReq.user._id.toString());

      res.status(200).json({
        success: true,
        message: 'Preferences deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting user preferences:', error);
      next(error);
    }
  };
}