import { Router, Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { OtpRepository } from '../repositories/OtpRepository';
import { UserInteractor } from '../interactors/UserInteractor';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Creating a new instance of UserRepository to handle data access operations for the User entity.
const userRepository = new UserRepository();
// Creating a new instance of OtpRepository to handle OTP data access operations.
const otpRepository = new OtpRepository();
// Creating a new instance of UserInteractor to contain application-specific business logic and orchestrate data flow.
// UserRepository and OtpRepository instances are injected into UserInteractor for database interaction.
const interactor = new UserInteractor(userRepository, otpRepository);
// Creating a new instance of AuthController to handle incoming HTTP requests related to user authentication.
// UserInteractor instance is injected into AuthController to delegate business logic execution.
const controller = new AuthController(interactor);


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Validate registration data and send OTP to email
 *     tags: [Authentication]
 *     description: |
 *       Validates user registration data and sends OTP to email.
 *       This is first step in two-step registration process.
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                     email:
 *                       type: string
 *                     step:
 *                       type: string
 *                       enum: [otp_sent]
 *       400:
 *         description: Bad request - Invalid data or user already exists
 */
router.post('/register', controller.register.bind(controller));

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [Authentication]
 *     description: |
 *       Resends a new OTP to the provided email address.
 *       Only works if there's an existing OTP request for the email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to resend OTP to
 *     responses:
 *       200:
 *         description: OTP resent successfully
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
 *                     email:
 *                       type: string
 *                     step:
 *                       type: string
 *                       enum: [otp_resent]
 *       400:
 *         description: Bad request - Invalid email or no OTP request found
 *       404:
 *         description: No OTP request found for this email
 */
router.post('/resend-otp', controller.resendOtp.bind(controller));

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags: [Authentication]
 *     description: |
 *       Verifies OTP and completes user registration.
 *       This is second step in the two-step registration process.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 description: One-Time Password sent to email (expires in 1 minute)
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request - Invalid OTP, expired OTP, or user already exists
 */
router.post('/verify-otp', controller.verifyOtpAndRegister.bind(controller));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', controller.login.bind(controller));

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     description: |
 *       Generates new access and refresh tokens using a valid refresh token.
 *       Frontend should call this automatically when access token expires.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token (expires in 30 days)
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
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
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid refresh token
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', controller.refreshToken.bind(controller));

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, controller.getProfile.bind(controller));

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
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
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticate, controller.updateProfile.bind(controller));

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
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


export default router;
