import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './products';
import cartRoutes from './cartRoutes';
import orderRoutes from './orders';
import adminRoutes from './adminRoutes';
import categoryRoutes from './categories';
import publicRoutes from './publicRoutes';
import paymentRoutes from './paymentRoutes';
import profileRoutes from './profileRoutes';
import userRoutes from './userRoutes';
import walletRoutes from './walletRoutes';
const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/public', publicRoutes);
router.use('/payment', paymentRoutes);
router.use('/profile', profileRoutes);
router.use('/user', userRoutes);
router.use('/wallet', walletRoutes);

export default router;

