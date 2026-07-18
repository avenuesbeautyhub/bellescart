import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /payment/create-intent:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in the currency's smallest unit (e.g., paise for INR)
 *               currency:
 *                 type: string
 *                 default: INR
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/create-intent', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, orderId } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
      return;
    }

    const result = await paymentService.createPaymentIntent({
      amount,
      currency: currency || 'INR',
      orderId,
      metadata: {
        userId: (req as any).user?._id?.toString() || '',
      }
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          orderId: result.orderId,
          razorpayOrderId: result.razorpayOrderId,
          amount: result.amount,
          currency: result.currency,
          keyId: result.keyId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /payment/confirm/{razorpayOrderId}:
 *   post:
 *     summary: Confirm a Razorpay payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: razorpayOrderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/confirm/:razorpayOrderId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId } = req.params;

    const result = await paymentService.confirmPayment(razorpayOrderId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /payment/cancel/{razorpayOrderId}:
 *   post:
 *     summary: Cancel/fetch a Razorpay order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: razorpayOrderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/cancel/:razorpayOrderId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId } = req.params;

    const result = await paymentService.cancelPaymentIntent(razorpayOrderId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Order fetched successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /payment/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentId
 *               - signature
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Razorpay order ID
 *               paymentId:
 *                 type: string
 *                 description: Razorpay payment ID
 *               signature:
 *                 type: string
 *                 description: Razorpay signature
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({
        success: false,
        error: 'orderId, paymentId, and signature are required'
      });
      return;
    }

    const result = await paymentService.verifyPaymentSignature(orderId, paymentId, signature);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
