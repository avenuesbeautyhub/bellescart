import { Response, NextFunction, Request } from 'express';
import { ICategoryInteractor } from '../providers/interfaces/ICategoryInteractor';

export class CategoryController {
  private _categoryInteractor: ICategoryInteractor;

  constructor(categoryInteractor: ICategoryInteractor) {
    this._categoryInteractor = categoryInteractor;
  }

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
