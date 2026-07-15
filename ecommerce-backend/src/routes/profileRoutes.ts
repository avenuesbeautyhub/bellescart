import { Router } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { OtpRepository } from '../repositories/OtpRepository';
import { UserInteractor } from '../interactors/UserInteractor';
import { ProfileController } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { upload } from '../services/cloudinaryService';

const router = Router();

// Creating a new instance of UserRepository to handle data access operations for the User entity.
const userRepository = new UserRepository();
// Creating a new instance of OtpRepository to handle OTP data access operations.
const otpRepository = new OtpRepository();
// Creating a new instance of UserInteractor to contain application-specific business logic and orchestrate data flow.
// UserRepository and OtpRepository instances are injected into UserInteractor for database interaction.
const interactor = new UserInteractor(userRepository, otpRepository);
// Creating a new instance of ProfileController to handle incoming HTTP requests related to user profile.
// UserInteractor instance is injected into ProfileController to delegate business logic execution.
const controller = new ProfileController(interactor);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, controller.getProfile.bind(controller));

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
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
 *               phone:
 *                 type: string
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/', authenticate, controller.updateProfile.bind(controller));

/**
 * @swagger
 * /profile/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', authenticate, controller.changePassword.bind(controller));

/**
 * @swagger
 * /profile/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request - No file uploaded or invalid file
 */
router.post('/profile-picture', authenticate, upload.single('file'), controller.uploadProfilePicture.bind(controller));

/**
 * @swagger
 * /profile/addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *             properties:
 *               label:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/addresses', authenticate, controller.addAddress.bind(controller));

/**
 * @swagger
 * /profile/addresses/{addressId}:
 *   put:
 *     summary: Update address
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               label:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/addresses/:addressId', authenticate, controller.updateAddress.bind(controller));

/**
 * @swagger
 * /profile/addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/addresses/:addressId', authenticate, controller.removeAddress.bind(controller));

/**
 * @swagger
 * /profile/addresses/{addressId}/default:
 *   put:
 *     summary: Set address as default
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/addresses/:addressId/default', authenticate, controller.setDefaultAddress.bind(controller));

/**
 * @swagger
 * /profile/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/wishlist', authenticate, controller.getWishlist.bind(controller));

/**
 * @swagger
 * /profile/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Profile]
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
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *       401:
 *         description: Unauthorized
 */
router.post('/wishlist', authenticate, controller.addToWishlist.bind(controller));

/**
 * @swagger
 * /profile/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       401:
 *         description: Unauthorized
 */
router.delete('/wishlist/:productId', authenticate, controller.removeFromWishlist.bind(controller));

export default router;
