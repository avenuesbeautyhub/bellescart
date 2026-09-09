import { Router } from 'express';
import { WalletRepository } from '../repositories/WalletRepository';
import { WalletInteractor } from '../interactors/WalletInteractor';
import { WalletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Creating instances for wallet operations
const walletRepository = new WalletRepository();
const walletInteractor = new WalletInteractor(walletRepository);
const walletController = new WalletController(walletInteractor);

// Apply authentication to all wallet routes
router.use(authenticate);

/**
 * @swagger
 * /wallet:
 *   get:
 *     summary: Get user wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', walletController.getWallet.bind(walletController));

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/balance', walletController.getWalletBalance.bind(walletController));

/**
 * @swagger
 * /wallet/credit:
 *   post:
 *     summary: Credit wallet (admin only or system operations)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to credit
 *               description:
 *                 type: string
 *                 description: Description of the transaction
 *               orderId:
 *                 type: string
 *                 description: Associated order ID (optional)
 *     responses:
 *       200:
 *         description: Wallet credited successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/credit', walletController.creditWallet.bind(walletController));

/**
 * @swagger
 * /wallet/debit:
 *   post:
 *     summary: Debit wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to debit
 *               description:
 *                 type: string
 *                 description: Description of the transaction
 *               orderId:
 *                 type: string
 *                 description: Associated order ID (optional)
 *     responses:
 *       200:
 *         description: Wallet debited successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/debit', walletController.debitWallet.bind(walletController));

export default router;