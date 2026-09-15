import { Router } from 'express';
import { UserPreferencesRepository } from '../repositories/UserPreferencesRepository';
import { UserPreferencesInteractor } from '../interactors/UserPreferencesInteractor';
import { UserPreferencesController } from '../controllers/UserPreferencesController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Creating instances following the dependency injection pattern
const preferencesRepository = new UserPreferencesRepository();
const preferencesInteractor = new UserPreferencesInteractor(preferencesRepository);
const controller = new UserPreferencesController(preferencesInteractor);

/**
 * @swagger
 * /preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, controller.getPreferences.bind(controller));

/**
 * @swagger
 * /preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, es, fr, de, it, pt, zh, ja, ko, ar]
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *                   orderUpdates:
 *                     type: boolean
 *                   promotions:
 *                     type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   profileVisibility:
 *                     type: string
 *                     enum: [public, private]
 *                   showActivity:
 *                     type: boolean
 *               accessibility:
 *                 type: object
 *                 properties:
 *                   fontSize:
 *                     type: string
 *                     enum: [small, medium, large]
 *                   highContrast:
 *                     type: boolean
 *                   reducedMotion:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request data
 */
router.put('/', authenticate, controller.updatePreferences.bind(controller));

/**
 * @swagger
 * /preferences/reset:
 *   post:
 *     summary: Reset user preferences to default
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences reset successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/reset', authenticate, controller.resetPreferences.bind(controller));

/**
 * @swagger
 * /preferences:
 *   delete:
 *     summary: Delete user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/', authenticate, controller.deletePreferences.bind(controller));

export default router;