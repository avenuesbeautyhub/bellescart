import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authMiddleware } from '@/middleware/authMiddleware';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post('/register', authController.register.bind(authController));
  router.post('/login', authController.login.bind(authController));
  router.get('/profile', authMiddleware, authController.getProfile.bind(authController));
  router.post('/refresh', authController.refreshToken.bind(authController));

  return router;
};
