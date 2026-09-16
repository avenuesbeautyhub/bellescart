import { Router } from 'express';
import { PrivacyPreferenceRepository } from '../repositories/PrivacyPreferenceRepository';
import { PrivacyRequestRepository } from '../repositories/PrivacyRequestRepository';
import { PrivacyInteractor } from '../interactors/PrivacyInteractor';
import { PrivacyController } from '../controllers/PrivacyController';
import { authenticate } from '../middleware/auth';
import { privacyRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Initialize repositories and interactor
const privacyPreferenceRepository = new PrivacyPreferenceRepository();
const privacyRequestRepository = new PrivacyRequestRepository();
const privacyInteractor = new PrivacyInteractor(privacyPreferenceRepository, privacyRequestRepository);
const privacyController = new PrivacyController(privacyInteractor);

/**
 * @swagger
 * /privacy/preferences:
 *   get:
 *     summary: Get user's privacy preferences
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', authenticate, privacyController.getPreferences.bind(privacyController));

/**
 * @swagger
 * /privacy/preferences:
 *   put:
 *     summary: Update user's privacy preferences
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marketingEmails:
 *                 type: boolean
 *                 description: Consent for marketing emails
 *     responses:
 *       200:
 *         description: Privacy preferences updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/preferences', authenticate, privacyRateLimiter, privacyController.updatePreferences.bind(privacyController));

/**
 * @swagger
 * /privacy/export:
 *   post:
 *     summary: Request a data export
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data export request submitted successfully
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Already have a pending export request
 */
router.post('/export', authenticate, privacyRateLimiter, privacyController.requestDataExport.bind(privacyController));

/**
 * @swagger
 * /privacy/requests:
 *   get:
 *     summary: Get user's privacy requests
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/requests', authenticate, privacyController.getUserRequests.bind(privacyController));

/**
 * @swagger
 * /privacy/export/{requestId}:
 *   get:
 *     summary: Download exported data
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export data retrieved successfully
 *       400:
 *         description: Export not completed yet
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.get('/export/:requestId', authenticate, privacyController.downloadExport.bind(privacyController));

export default router;
