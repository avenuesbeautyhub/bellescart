import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';
import { authenticate } from '../middleware/auth';
import { paymentRateLimiter } from '../middleware/rateLimiter';

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
router.post('/create-intent', authenticate, paymentRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, orderId } = req.body;
    const userId = (req as any).user?._id?.toString();

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
      userId,
      metadata: {
        userId: userId || '',
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

/**
 * @swagger
 * /payment/history:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id?.toString();
    const { page, limit, status } = req.query;

    const result = await paymentService.getUserPaymentHistory(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as 'pending' | 'completed' | 'failed' | 'refunded'
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          payments: result.payments,
          pagination: result.pagination
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
 * /payment/booking/{bookingId}:
 *   get:
 *     summary: Get payment by booking ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/booking/:bookingId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;

    const result = await paymentService.getPaymentByBookingId(bookingId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.payment
      });
    } else {
      res.status(404).json({
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
 * /payment/razorpay/{razorpayPaymentId}:
 *   get:
 *     summary: Get payment by Razorpay payment ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: razorpayPaymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/razorpay/:razorpayPaymentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayPaymentId } = req.params;

    const result = await paymentService.getPaymentByRazorpayPaymentId(razorpayPaymentId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.payment
      });
    } else {
      res.status(404).json({
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
 * /payment/create-record:
 *   post:
 *     summary: Create a payment record manually (for non-Razorpay payments)
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
 *               - bookingId
 *               - amount
 *               - currency
 *               - paymentMethod
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: INR
 *               paymentMethod:
 *                 type: string
 *                 enum: [razorpay, stripe, paypal, cash_on_delivery, credit_card, debit_card]
 *               orderId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *                 default: pending
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment record created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/create-record', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id?.toString();
    const { bookingId, amount, currency, paymentMethod, orderId, status, metadata } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      res.status(400).json({
        success: false,
        error: 'bookingId, amount, and paymentMethod are required'
      });
      return;
    }

    const result = await paymentService.createPaymentRecord({
      bookingId,
      amount,
      currency: currency || 'INR',
      paymentMethod,
      userId,
      orderId,
      status: status || 'pending',
      metadata
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.payment
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
