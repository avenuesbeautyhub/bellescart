import { Router } from 'express';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CategoryInteractor } from '../interactors/CategoryInteractor';
import { CategoryController } from '../controllers/CategoryController';
import { authenticate, authenticateAdmin } from '../middleware/auth';

const router = Router();

// Creating instances
const categoryRepository = new CategoryRepository();
const categoryInteractor = new CategoryInteractor(categoryRepository);
const categoryController = new CategoryController(categoryInteractor);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all active categories (for dropdown)
 *     tags: [Categories]
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
 */
router.get('/', categoryController.getAllCategories.bind(categoryController));

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.getCategoryById.bind(categoryController));



export default router;
