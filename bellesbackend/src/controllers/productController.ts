import { Request, Response } from 'express';
import { BaseResponse } from '@/responses/baseResponse';
import { HTTP_STATUS_CODES } from '@/constants/statusCodes';
import { IAuthenticatedRequest } from '@/middleware/authMiddleware';
import { ICreateProductRequest, IUpdateProductRequest, IProductQuery } from '@/dto/requestDTO/productDTO';

export interface IProductController {
  createProduct: (req: Request, res: Response) => Promise<void>;
  getProducts: (req: Request, res: Response) => Promise<void>;
  getProductById: (req: Request, res: Response) => Promise<void>;
  updateProduct: (req: Request, res: Response) => Promise<void>;
  deleteProduct: (req: Request, res: Response) => Promise<void>;
  getPopularProducts: (req: Request, res: Response) => Promise<void>;
  searchProducts: (req: Request, res: Response) => Promise<void>;
}

export class ProductController implements IProductController {
  constructor(
    private productService: any,
    private categoryService: any
  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: ICreateProductRequest = req.body;
      const result = await this.productService.createProduct(productData);
      
      res.status(HTTP_STATUS_CODES.CREATED).json(
        BaseResponse.success('Product created successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const query: IProductQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        category: req.query.category as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        inStock: req.query.inStock === 'true'
      };

      const result = await this.productService.getProducts(query);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Products retrieved successfully', result.products, result.pagination)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.productService.getProductById(id);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Product retrieved successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IUpdateProductRequest = req.body;
      const result = await this.productService.updateProduct(id, updateData);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Product updated successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Product deleted successfully')
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getPopularProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const result = await this.productService.getPopularProducts(limit);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Popular products retrieved successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!q || typeof q !== 'string') {
        throw new Error('VALIDATION_ERROR');
      }

      const result = await this.productService.searchProducts(q, limit);
      
      res.status(HTTP_STATUS_CODES.OK).json(
        BaseResponse.success('Search results retrieved successfully', result)
      );
    } catch (error: any) {
      throw error;
    }
  }
}
