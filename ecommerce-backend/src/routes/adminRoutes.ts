import { Router, Request, Response, NextFunction } from 'express';
import { AdminRepository } from '../repositories/AdminRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { AdminInteractor } from '../interactors/AdminInteractor';
import { ProductInteractor } from '../interactors/ProductInteractor';
import { CategoryInteractor } from '../interactors/CategoryInteractor';
import { AdminController } from '../controllers/adminController';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateAdmin } from '../middleware/auth';
import { upload } from '../services/cloudinaryService';

const router = Router();

// Creating instances for repositories
const adminRepository = new AdminRepository();
const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();

// Creating instances for interactors
const categoryInteractor = new CategoryInteractor(categoryRepository);
const productInteractor = new ProductInteractor(productRepository, categoryInteractor);
const adminInteractor = new AdminInteractor(adminRepository, productInteractor, categoryInteractor);

// Creating instances of controllers
const controller = new AdminController(adminInteractor);
const categoryController = new CategoryController(categoryInteractor);

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin user
 *     tags: [Admin Authentication]
 *     description: |
 *       Creates a new admin user with registration key protection.
 *       Requires a valid registration key to create admin accounts.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - registrationKey
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 description: Admin password (min 6 characters)
 *               phone:
 *                 type: string
 *                 description: Admin phone number (optional)
 *               registrationKey:
 *                 type: string
 *                 description: Admin registration key for security
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: Object
 *                   properties:
 *                     admin:
 *                       type: Object
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Invalid registration key
 *       409:
 *         description: Admin with this email already exists
 */
router.post('/register', controller.registerAdmin.bind(controller));

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Authenticate admin user
 *     tags: [Admin Authentication]
 *     description: |
 *       Authenticates an admin user with email and password.
 *       Returns JWT tokens for authenticated admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: Object
 *                   properties:
 *                     admin:
 *                       type: Object
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', controller.adminLogin.bind(controller));

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateAdmin, controller.getAdminProfile.bind(controller));

/**
 * @swagger
 * /admin/profile:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Admin profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateAdmin, controller.updateAdminProfile.bind(controller));

/**
 * @swagger
 * /admin/change-password:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: Object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', authenticateAdmin, controller.changeAdminPassword.bind(controller));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/users', authenticateAdmin, controller.getAllUsers.bind(controller));

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/users/:userId', authenticateAdmin, controller.getUserById.bind(controller));

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   put:
 *     summary: Update user status (admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: Object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.put('/users/:userId/status', authenticateAdmin, controller.updateUserStatus.bind(controller));

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/users/:userId', authenticateAdmin, controller.deleteUser.bind(controller));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get admin statistics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateAdmin, controller.getAdminStats.bind(controller));

/**
 * @swagger
 * /admin/upload-image:
 *   post:
 *     summary: Upload a single product image
 *     tags: [Admin Image Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     size:
 *                       type: number
 *                     mimeType:
 *                       type: string
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/upload-image', authenticateAdmin, upload.single('image'), controller.uploadProductImage.bind(controller));

/**
 * @swagger
 * /admin/upload-images:
 *   post:
 *     summary: Upload multiple product images
 *     tags: [Admin Image Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product image files (max 5 images, 5MB each)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       publicId:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       size:
 *                         type: number
 *                       mimeType:
 *                         type: string
 *       400:
 *         description: Upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/upload-images', authenticateAdmin, upload.array('images', 5), controller.uploadMultipleProductImages.bind(controller));

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Admin Product Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               category:
 *                 type: string
 *                 description: Product category ID
 *               brand:
 *                 type: string
 *                 description: Product brand (optional)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product tags (optional)
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *                 description: Product status
 *               featured:
 *                 type: boolean
 *                 description: Featured product
 *               quantity:
 *                 type: number
 *                 description: Product quantity in stock
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (optional, max 5 images, 5MB each)
 *               imageAlts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Alt text for each image
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     uploadedImages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           alt:
 *                             type: string
 *                           isMain:
 *                             type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/products', authenticateAdmin, upload.array('images', 5), controller.createProduct.bind(controller));

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Admin Product Management]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               category:
 *                 type: string
 *                 description: Product category
 *               subcategory:
 *                 type: string
 *                 description: Product subcategory
 *               brand:
 *                 type: string
 *                 description: Product brand
 *               sku:
 *                 type: string
 *                 description: Product SKU
 *               quantity:
 *                 type: number
 *                 description: Product quantity
 *               trackQuantity:
 *                 type: boolean
 *                 description: Track inventory
 *               allowBackorder:
 *                 type: boolean
 *                 description: Allow backorders
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New product images (optional, max 5 images, 5MB each)
 *               imageAlts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Alt text for new images
 *               keepExistingImages:
 *                 type: boolean
 *                 description: Keep existing images and add new ones
 *               mainImageIndex:
 *                 type: string
 *                 description: Index of new main image
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     newImages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           alt:
 *                             type: string
 *                           isMain:
 *                             type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put('/products/:id', authenticateAdmin, upload.array('images', 5), controller.updateProduct.bind(controller));

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Admin Product Management]
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
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', authenticateAdmin, controller.deleteProduct.bind(controller));

// Category Management Routes
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
 *               parentCategory:
 *                 type: string
 *                 description: Parent category ID (for subcategories)
 *               sortOrder:
 *                 type: number
 *                 description: Sort order for display
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
 *               parentCategory:
 *                 type: string
 *               sortOrder:
 *                 type: number
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
