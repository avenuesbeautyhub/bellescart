import { Router } from 'express';
import { PrivacyRequestRepository } from '../repositories/PrivacyRequestRepository';
import { AdminPrivacyController } from '../controllers/AdminPrivacyController';
import { authenticateAdmin } from '../middleware/auth';
import { adminRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Initialize repository and controller
const privacyRequestRepository = new PrivacyRequestRepository();
const adminPrivacyController = new AdminPrivacyController(privacyRequestRepository);

/**
 * @swagger
 * /admin/privacy/requests:
 *   get:
 *     summary: Get all privacy requests (admin only)
 *     tags: [Admin Privacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [export]
 *     responses:
 *       200:
 *         description: Privacy requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get('/requests', authenticateAdmin, adminRateLimiter, adminPrivacyController.getAllRequests.bind(adminPrivacyController));

/**
 * @swagger
 * /admin/privacy/requests/{requestId}:
 *   get:
 *     summary: Get privacy request by ID (admin only)
 *     tags: [Admin Privacy]
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
 *         description: Privacy request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Request not found
 */
router.get('/requests/:requestId', authenticateAdmin, adminPrivacyController.getRequestById.bind(adminPrivacyController));

/**
 * @swagger
 * /admin/privacy/stats:
 *   get:
 *     summary: Get privacy request statistics (admin only)
 *     tags: [Admin Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy request statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get('/stats', authenticateAdmin, adminPrivacyController.getRequestStats.bind(adminPrivacyController));

export default router;
