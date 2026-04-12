import { Router } from 'express';
import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { CartInteractor } from '../interactors/CartInteractor';
import { CartController } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Creating a new instance of CartRepository to handle data access operations for the Cart entity.
const cartRepository = new CartRepository();
// Creating a new instance of ProductRepository to handle data access operations for the Product entity.
const productRepository = new ProductRepository();
// Creating a new instance of CartInteractor to contain application-specific business logic and orchestrate data flow.
// CartRepository and ProductRepository instances are injected into CartInteractor for database interaction.
const interactor = new CartInteractor(cartRepository, productRepository);
// Creating a new instance of CartController to handle incoming HTTP requests related to cart operations.
// CartInteractor instance is injected into CartController to delegate business logic execution.
const controller = new CartController(interactor);

// All cart routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', controller.getCart.bind(controller));

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/add', controller.addToCart.bind(controller));

/**
 * @swagger
 * /cart/item/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.put('/item/:itemId', controller.updateCartItem.bind(controller));

/**
 * @swagger
 * /cart/item/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.delete('/item/:itemId', controller.removeFromCart.bind(controller));

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/clear', controller.clearCart.bind(controller));

export default router;
