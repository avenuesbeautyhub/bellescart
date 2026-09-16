import { Response, NextFunction, Request } from 'express';
import { IReviewInteractor } from '../providers/interfaces/IReviewInteractor';
import { AdminRequest } from '../middleware/auth';

export class AdminReviewController {
  private _reviewInteractor: IReviewInteractor;

  constructor(reviewInteractor: IReviewInteractor) {
    this._reviewInteractor = reviewInteractor;
  }

  getAllReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, status, productId, userId } = req.query;

      const result = await this._reviewInteractor.getAllReviews({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        productId: productId as string,
        userId: userId as string
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateReviewStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be pending, approved, or rejected'
        });
        return;
      }

      const review = await this._reviewInteractor.updateReviewStatus(reviewId, status);

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
      const adminReq = req as AdminRequest;
      const adminId = adminReq.admin?._id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          error: 'Admin not authenticated'
        });
        return;
      }

      const { reviewId } = req.params;

      // Admin can delete any review - use repository directly
      const { ReviewRepository } = await import('../repositories/reviewRepository');
      const reviewRepository = new ReviewRepository();
      const review = await reviewRepository.delete(reviewId);

      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found'
        });
        return;
      }

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

      const summary = await this._reviewInteractor.getReviewSummary(productId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  };
}