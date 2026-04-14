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


// Admin routes
/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Admin Category Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/categories', authenticateAdmin, categoryController.createCategory.bind(categoryController));

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     summary: Update a category (admin only)
 *     tags: [Admin Category Management]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', authenticateAdmin, categoryController.updateCategory.bind(categoryController));

/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     summary: Delete a category (admin only)
 *     tags: [Admin Category Management]
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
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', authenticateAdmin, categoryController.deleteCategory.bind(categoryController));

export default router;
