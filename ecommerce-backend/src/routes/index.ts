import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './products';
import cartRoutes from './cartRoutes';
import orderRoutes from './orders';
import adminRoutes from './adminRoutes';
import categoryRoutes from './categories';
const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);

export default router;

