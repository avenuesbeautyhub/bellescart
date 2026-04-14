import { Response, NextFunction, Request } from 'express';
import { ICategoryInteractor } from '../providers/interfaces/ICategoryInteractor';
import { AdminRequest } from '../middleware/auth';

export class CategoryController {
  private _categoryInteractor: ICategoryInteractor;

  constructor(categoryInteractor: ICategoryInteractor) {
    this._categoryInteractor = categoryInteractor;
  }

  // Admin methods
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          error: 'Admin not authenticated'
        });
        return;
      }

      const category = await this._categoryInteractor.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Category creation failed'
      });
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          error: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const category = await this._categoryInteractor.updateCategory(id, req.body);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Category update failed'
      });
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AdminRequest;
      if (!authReq.admin) {
        res.status(401).json({
          success: false,
          error: 'Admin not authenticated'
        });
        return;
      }

      const { id } = req.params;
      const category = await this._categoryInteractor.deleteCategory(id);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Category deletion failed'
      });
    }
  };

  // Public methods (for dropdown)
  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this._categoryInteractor.getActiveCategories();

      res.status(200).json({
        success: true,
        data: { categories }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get categories'
      });
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this._categoryInteractor.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get category'
      });
    }
  };

}
