import { Response, NextFunction, Request } from 'express';
import { IReviewInteractor } from '../providers/interfaces/IReviewInteractor';
import { AuthRequest } from '../middleware/auth';

export class ReviewController {
  private _reviewInteractor: IReviewInteractor;

  constructor(reviewInteractor: IReviewInteractor) {
    this._reviewInteractor = reviewInteractor;
  }

  createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      console.log('[REVIEW DEBUG] Creating review for user:', userId);
      console.log('[REVIEW DEBUG] Request body:', req.body);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { productId, rating, title, comment, images } = req.body;

      // Validation
      if (!productId || !rating || !comment) {
        res.status(400).json({
          success: false,
          error: 'productId, rating, and comment are required'
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
        return;
      }

      if (comment.length > 2000) {
        res.status(400).json({
          success: false,
          error: 'Comment cannot exceed 2000 characters'
        });
        return;
      }

      if (title && title.length > 100) {
        res.status(400).json({
          success: false,
          error: 'Title cannot exceed 100 characters'
        });
        return;
      }

      console.log('[REVIEW DEBUG] Calling interactor to create review');
      const review = await this._reviewInteractor.createReview(userId.toString(), {
        productId,
        rating,
        title,
        comment,
        images
      });
      console.log('[REVIEW DEBUG] Review created successfully:', review._id);

      res.status(201).json({
        success: true,
        data: { review }
      });
    } catch (error) {
      console.error('[REVIEW DEBUG] Error creating review:', error);
      next(error);
    }
  };

  getReviewsByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      if (!productId) {
        res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
        return;
      }

      const result = await this._reviewInteractor.getReviewsByProduct(productId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { page = 1, limit = 10 } = req.query;

      const result = await this._reviewInteractor.getReviewsByUser(userId.toString(), {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { productId } = req.params;

      const eligibility = await this._reviewInteractor.getReviewEligibility(userId.toString(), productId);

      res.status(200).json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { reviewId } = req.params;
      const { rating, title, comment, images } = req.body;

      // Validation
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
        return;
      }

      if (comment && comment.length > 2000) {
        res.status(400).json({
          success: false,
          error: 'Comment cannot exceed 2000 characters'
        });
        return;
      }

      if (title && title.length > 100) {
        res.status(400).json({
          success: false,
          error: 'Title cannot exceed 100 characters'
        });
        return;
      }

      const review = await this._reviewInteractor.updateReview(reviewId, userId.toString(), {
        rating,
        title,
        comment,
        images
      });

      res.status(200).json({
        success: true,
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { reviewId } = req.params;

      const review = await this._reviewInteractor.deleteReview(reviewId, userId.toString());

      res.status(200).json({
        success: true,
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
        return;
      }

      const summary = await this._reviewInteractor.getReviewSummary(productId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewSummaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productIds } = req.query;

      if (!productIds || typeof productIds !== 'string') {
        res.status(400).json({
          success: false,
          error: 'productIds query parameter is required'
        });
        return;
      }

      const ids = productIds.split(',').map(id => id.trim());
      const summaries = await this._reviewInteractor.getReviewSummaries(ids);

      // Convert Map to object for JSON response
      const summariesObj: Record<string, { averageRating: number; totalReviews: number }> = {};
      summaries.forEach((value, key) => {
        summariesObj[key] = value;
      });

      res.status(200).json({
        success: true,
        data: summariesObj
      });
    } catch (error) {
      next(error);
    }
  };
}