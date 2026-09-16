import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ReviewController } from '../controllers/reviewController';
import { ReviewInteractor } from '../interactors/ReviewInteractor';

const router = Router();
const reviewInteractor = new ReviewInteractor();
const reviewController = new ReviewController(reviewInteractor);

// User review routes (authenticated)
router.post('/', authenticate, reviewController.createReview);
router.get('/my', authenticate, reviewController.getReviewsByUser);
router.get('/eligibility/:productId', authenticate, reviewController.getReviewEligibility);
router.put('/:reviewId', authenticate, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

export default router;