import { Router } from 'express';
import { CouponRepository } from '../repositories/CouponRepository';
import { CouponInteractor } from '../interactors/CouponInteractor';
import { CouponController } from '../controllers/CouponController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Creating instances for user coupon operations
const couponRepository = new CouponRepository();
const couponInteractor = new CouponInteractor(couponRepository);
const couponController = new CouponController(couponInteractor);

// Apply authentication to all user routes
router.use(authenticate);

/**
 * @swagger
 * /user/coupons/validate/{code}:
 *   post:
 *     summary: Validate coupon code (user auth required)
 *     tags: [User Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartTotal:
 *                 type: number
 *               cartCategory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon validation result
 *       401:
 *         description: Unauthorized
 */
router.post('/coupons/validate/:code', couponController.validateCoupon.bind(couponController));

/**
 * @swagger
 * /user/coupons/apply/{code}:
 *   post:
 *     summary: Apply coupon to cart (user auth required)
 *     tags: [User Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartTotal
 *             properties:
 *               cartTotal:
 *                 type: number
 *               cartCategory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/coupons/apply/:code', couponController.applyCoupon.bind(couponController));

export default router;
