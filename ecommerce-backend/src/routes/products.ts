import { Router } from 'express';
import { ProductRepository } from '../repositories/ProductRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ProductInteractor } from '../interactors/ProductInteractor';
import { CategoryInteractor } from '../interactors/CategoryInteractor';
import { authenticate, authorize } from '../middleware/auth';
import { ProductController } from '../controllers/productController';
import { CategoryController } from '../controllers/CategoryController';
import { publicRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Creating a new instance of ProductRepository to handle data access operations for the Product entity.
const repository = new ProductRepository();
// Creating a new instance of CategoryRepository to handle category operations
const categoryRepository = new CategoryRepository();
// Creating a new instance of CategoryInteractor to handle category business logic
const categoryInteractor = new CategoryInteractor(categoryRepository);
// Creating a new instance of ProductInteractor to contain application-specific business logic and orchestrate data flow.
// ProductRepository and CategoryInteractor instances are injected into ProductInteractor for database interaction.
const interactor: ProductInteractor = new ProductInteractor(repository, categoryInteractor);
// Creating a new instance of ProductController to handle incoming HTTP requests related to product operations.
// ProductInteractor instance is injected into ProductController to delegate business logic execution.
const controller: ProductController = new ProductController(interactor);

const categoryController: CategoryController = new CategoryController(categoryInteractor);

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
router.get('/search', publicRateLimiter, controller.searchProducts.bind(controller));





///for users

router.get('/categories', authenticate, categoryController.getAllCategories.bind(categoryController));

/**
 * @swagger
 * /public/products:
 *   get:
 *     summary: Get all products (public)
 *     tags: [Public Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
router.get('/products', authenticate, controller.getProducts.bind(controller));

/**
 * @swagger
 * /public/products/featured:
 *   get:
 *     summary: Get featured products (public)
 *     tags: [Public Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/products/featured', authenticate, controller.getFeaturedProducts.bind(controller));

/**
 * @swagger
 * /public/products/search:
 *   get:
 *     summary: Search products (public)
 *     tags: [Public Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
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
 */
router.get('/products/search', authenticate, controller.searchProducts.bind(controller));

/**
 * @swagger
 * /public/products/category/:category:
 *   get:
 *     summary: Get products by category (public)
 *     tags: [Public Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products by category retrieved successfully
 */
router.get('/products/category/:category', authenticate, controller.getProductsByCategory.bind(controller));

/**
 * @swagger
 * /public/products/:id:
 *   get:
 *     summary: Get product by ID (public)
 *     tags: [Public Products]
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
router.get('/products/:id', authenticate, controller.getProductById.bind(controller));

export default router;
