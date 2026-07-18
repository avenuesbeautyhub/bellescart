import { Router } from 'express';
import { ProductRepository } from '../repositories/ProductRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { ProductInteractor } from '../interactors/ProductInteractor';
import { CategoryInteractor } from '../interactors/CategoryInteractor';
import { ProductController } from '../controllers/productController';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();

// Creating instances for public access
const repository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const categoryInteractor = new CategoryInteractor(categoryRepository);
const interactor = new ProductInteractor(repository, categoryInteractor);
const controller = new ProductController(interactor);
const categoryController = new CategoryController(categoryInteractor);

/**
 * @swagger
 * /public/categories:
 *   get:
 *     summary: Get all categories (public)
 *     tags: [Public Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *       400:
 *         description: Failed to retrieve categories
 */
router.get('/categories', categoryController.getAllCategories.bind(categoryController));

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
router.get('/products', controller.getProducts.bind(controller));

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
router.get('/products/featured', controller.getFeaturedProducts.bind(controller));

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
router.get('/products/search', controller.searchProducts.bind(controller));

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
router.get('/products/category/:category', controller.getProductsByCategory.bind(controller));

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
router.get('/products/:id', controller.getProductById.bind(controller));

export default router;
