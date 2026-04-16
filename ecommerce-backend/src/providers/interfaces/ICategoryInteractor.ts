import { ICategory } from '../../models/Category';

export interface ICategoryInteractor {
  createCategory(categoryData: {
    name: string;
    description?: string;
  }): Promise<ICategory>;
  getCategoryById(id: string): Promise<ICategory | null>;
  getCategoryByName(name: string): Promise<ICategory | null>;
  getAllCategories(): Promise<ICategory[]>;
  getActiveCategories(): Promise<ICategory[]>;
  updateCategory(id: string, updateData: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<ICategory | null>;
  deleteCategory(id: string): Promise<ICategory | null>;
}
