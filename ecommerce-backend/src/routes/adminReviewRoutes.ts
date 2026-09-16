import { Router } from 'express';
import { authenticateAdmin, authorize } from '../middleware/auth';
import { AdminReviewController } from '../controllers/adminReviewController';
import { ReviewInteractor } from '../interactors/ReviewInteractor';

const router = Router();
const reviewInteractor = new ReviewInteractor();
const adminReviewController = new AdminReviewController(reviewInteractor);

// Admin review management routes
router.get('/', authenticateAdmin, authorize('admin'), adminReviewController.getAllReviews);
router.patch('/:reviewId/status', authenticateAdmin, authorize('admin'), adminReviewController.updateReviewStatus);
router.delete('/:reviewId', authenticateAdmin, authorize('admin'), adminReviewController.deleteReview);
router.get('/summary/:productId', authenticateAdmin, authorize('admin'), adminReviewController.getReviewSummary);

export default router;