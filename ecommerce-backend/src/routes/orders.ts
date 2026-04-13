import { Router } from 'express';
import { OrderRepository } from '../repositories/OrderRepository';
import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { OrderInteractor } from '../interactors/OrderInteractor';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Creating a new instance of OrderRepository to handle data access operations for the Order entity.
const orderRepository = new OrderRepository();
// Creating a new instance of CartRepository to handle data access operations for the Cart entity.
const cartRepository = new CartRepository();
// Creating a new instance of ProductRepository to handle data access operations for the Product entity.
const productRepository = new ProductRepository();
// Creating a new instance of OrderInteractor to contain application-specific business logic and orchestrate data flow.
// OrderRepository, CartRepository, and ProductRepository instances are injected into OrderInteractor for database interaction.
const interactor = new OrderInteractor(orderRepository, cartRepository, productRepository);
// Creating a new instance of OrderController to handle incoming HTTP requests related to order operations.
// OrderInteractor instance is injected into OrderController to delegate business logic execution.
const controller = new OrderController(interactor);

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
router.post('/', authenticate, controller.createOrder.bind(controller));

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

export default router;
