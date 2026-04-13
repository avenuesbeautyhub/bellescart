import { Router, Request, Response, NextFunction } from 'express';
import { AdminRepository } from '../repositories/AdminRepository';
import { AdminInteractor } from '../interactors/AdminInteractor';
import { AdminController } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Creating a new instance of AdminRepository to handle data access operations for Admin entity.
const adminRepository = new AdminRepository();
// Creating a new instance of AdminInteractor to contain application-specific business logic and orchestrate data flow.
// AdminRepository instance is injected into AdminInteractor for database interaction.
const interactor = new AdminInteractor(adminRepository);
// Creating a new instance of AdminController to handle incoming HTTP requests related to admin authentication.
// AdminInteractor instance is injected into AdminController to delegate business logic execution.
const controller = new AdminController(interactor);

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

export default router;
