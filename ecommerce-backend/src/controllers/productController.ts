import { Response, NextFunction, Request } from 'express';
import { IProductInteractor } from '../providers/interfaces/IProductInteractor';

export class ProductController {
  private _productInteractor: IProductInteractor;

  constructor(productInteractor: IProductInteractor) {
    this._productInteractor = productInteractor;
  }

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        search,
        sort = 'createdAt',
        order = 'desc',
        featured
      } = req.query;

      const result = await this._productInteractor.getProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        subcategory: subcategory as string,
        brand: brand as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string,
        sort: sort as string,
        order: order as 'asc' | 'desc',
        featured: featured === 'true'
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this._productInteractor.getProductById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  };


  getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 10 } = req.query;

      const products = await this._productInteractor.getFeaturedProducts(parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;

      const result = await this._productInteractor.getProductsByCategory(category, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: sort as string,
        order: order as 'asc' | 'desc'
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q: searchQuery, page = 1, limit = 20 } = req.query;

      if (!searchQuery) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      const result = await this._productInteractor.getProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: searchQuery as string,
        sort: 'name',
        order: 'asc'
      });

      res.status(200).json({
        success: true,
        data: {
          products: result.products,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  };

}
