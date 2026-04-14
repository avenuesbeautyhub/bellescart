import { Router } from 'express';
import { ProductRepository } from '../repositories/ProductRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ProductInteractor } from '../interactors/ProductInteractor';
import { CategoryInteractor } from '../interactors/CategoryInteractor';
import { ProductController } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Creating a new instance of ProductRepository to handle data access operations for the Product entity.
const repository = new ProductRepository();
// Creating a new instance of CategoryRepository to handle category operations
const categoryRepository = new CategoryRepository();
// Creating a new instance of CategoryInteractor to handle category business logic
const categoryInteractor = new CategoryInteractor(categoryRepository);
// Creating a new instance of ProductInteractor to contain application-specific business logic and orchestrate data flow.
// ProductRepository and CategoryInteractor instances are injected into ProductInteractor for database interaction.
const interactor = new ProductInteractor(repository, categoryInteractor);
// Creating a new instance of ProductController to handle incoming HTTP requests related to product operations.
// ProductInteractor instance is injected into ProductController to delegate business logic execution.
const controller = new ProductController(interactor);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
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
 *         description: Products retrieved successfully
 */
router.get('/', authenticate, controller.getProducts.bind(controller));

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured', authenticate, controller.getFeaturedProducts.bind(controller));

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/category/:category', authenticate, controller.getProductsByCategory.bind(controller));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', authenticate, controller.getProductById.bind(controller));

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 */
router.get('/search', controller.searchProducts.bind(controller));

export default router;
