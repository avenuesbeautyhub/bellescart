import { Router } from 'express';
import { OrderRepository } from '../repositories/OrderRepository';
import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { OrderInteractor } from '../interactors/OrderInteractor';
import { WalletInteractor } from '../interactors/WalletInteractor';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { orderRateLimiter, shippingRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Creating a new instance of OrderRepository to handle data access operations for the Order entity.
const orderRepository = new OrderRepository();
// Creating a new instance of CartRepository to handle data access operations for the Cart entity.
const cartRepository = new CartRepository();
// Creating a new instance of ProductRepository to handle data access operations for the Product entity.
const productRepository = new ProductRepository();
// Creating a new instance of UserRepository to handle data access operations for the User entity.
const userRepository = new UserRepository();
// Creating a new instance of WalletRepository to handle data access operations for the Wallet entity.
const walletRepository = new WalletRepository();
// Creating a new instance of WalletInteractor to contain wallet-specific business logic.
const walletInteractor = new WalletInteractor(walletRepository);
// Creating a new instance of OrderInteractor to contain application-specific business logic and orchestrate data flow.
// OrderRepository, CartRepository, ProductRepository, UserRepository, and WalletInteractor instances are injected into OrderInteractor for database interaction.
const interactor = new OrderInteractor(orderRepository, cartRepository, productRepository, userRepository, walletInteractor);
// Creating a new instance of OrderController to handle incoming HTTP requests related to order operations.
// OrderInteractor and CartRepository instances are injected into OrderController to delegate business logic execution.
const controller = new OrderController(interactor, cartRepository);

// All order routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, orderRateLimiter, controller.createOrder.bind(controller));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, controller.getOrders.bind(controller));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticate, controller.getOrderById.bind(controller));

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', authenticate,controller.cancelOrder.bind(controller));

/**
 * @swagger
 * /orders/{id}/return:
 *   post:
 *     summary: Return a delivered order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - returnReason
 *             properties:
 *               returnReason:
 *                 type: string
 *                 description: Reason for returning the order
 *     responses:
 *       200:
 *         description: Order returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       400:
 *         description: Bad request
 */
router.post('/:id/return', authenticate, controller.returnOrder.bind(controller));

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.put('/:id/status', controller.updateOrderStatus.bind(controller));

/**
 * @swagger
 * /orders/shipping/calculate:
 *   post:
 *     summary: Calculate shipping rates using Shypfy
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup_postcode
 *               - delivery_postcode
 *               - weight
 *             properties:
 *               pickup_postcode:
 *                 type: string
 *                 description: Pickup location pincode
 *               delivery_postcode:
 *                 type: string
 *                 description: Delivery location pincode
 *               weight:
 *                 type: number
 *                 description: Package weight in kg
 *               cod:
 *                 type: number
 *                 description: COD amount (0 for prepaid)
 *     responses:
 *       200:
 *         description: Shipping rates calculated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/shipping/calculate', authenticate, shippingRateLimiter, controller.calculateShipping.bind(controller));

/**
 * @swagger
 * /orders/track/{awb}:
 *   get:
 *     summary: Track order by AWB number
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: awb
 *         required: true
 *         schema:
 *           type: string
 *         description: AWB number
 *     responses:
 *       200:
 *         description: Tracking data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.get('/track/:awb', authenticate, controller.trackOrder.bind(controller));

/**
 * @swagger
 * /orders/{id}/track:
 *   get:
 *     summary: Track order by order ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Tracking data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       400:
 *         description: Bad request
 */
router.get('/:id/track', authenticate, controller.trackOrderByOrderId.bind(controller));

/**
 * @swagger
 * /orders/{orderId}/nimbus/retry:
 *   post:
 *     summary: Retry NimbusPost integration for an existing order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courierId
 *             properties:
 *               courierId:
 *                 type: string
 *                 description: Courier ID to assign
 *     responses:
 *       200:
 *         description: NimbusPost integration retried successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/:orderId/nimbus/retry', authenticate, controller.retryNimbusIntegration.bind(controller));

export default router;
