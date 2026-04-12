import { Router } from 'express';
import { ProductController } from '@/controllers/productController';
import { authMiddleware, adminMiddleware } from '@/middleware/authMiddleware';

export const createProductRoutes = (productController: ProductController): Router => {
  const router = Router();

  router.get('/popular', productController.getPopularProducts.bind(productController));
  router.get('/search', productController.searchProducts.bind(productController));
  router.get('/', productController.getProducts.bind(productController));
  router.get('/:id', productController.getProductById.bind(productController));
  
  router.post('/', authMiddleware, adminMiddleware, productController.createProduct.bind(productController));
  router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct.bind(productController));
  router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct.bind(productController));

  return router;
};
