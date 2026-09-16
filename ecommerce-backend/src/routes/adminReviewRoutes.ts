import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import { AdminReviewController } from '../controllers/adminReviewController';
import { ReviewInteractor } from '../interactors/ReviewInteractor';

const router = Router();
const reviewInteractor = new ReviewInteractor();
const adminReviewController = new AdminReviewController(reviewInteractor);

// Admin review management routes
// authenticateAdmin already ensures the user is an admin by checking the Admin collection
router.get('/', authenticateAdmin, adminReviewController.getAllReviews);
router.patch('/:reviewId/status', authenticateAdmin, adminReviewController.updateReviewStatus);
router.delete('/:reviewId', authenticateAdmin, adminReviewController.deleteReview);
router.get('/summary/:productId', authenticateAdmin, adminReviewController.getReviewSummary);

export default router;
