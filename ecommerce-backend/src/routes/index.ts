import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './products';
import cartRoutes from './cartRoutes';
import orderRoutes from './orders';
import adminRoutes from './adminRoutes';
const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;

