import { ICategoryInteractor } from '../providers/interfaces/ICategoryInteractor';
import { ICategoryRepository } from '../repositories/CategoryRepository';
import { ICategory } from '../models/Category';
import mongoose from 'mongoose';

export class CategoryInteractor implements ICategoryInteractor {
  private _categoryRepository: ICategoryRepository;

  constructor(categoryRepository: ICategoryRepository) {
    this._categoryRepository = categoryRepository;
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
  }): Promise<ICategory> {
    try {
      // Check if category with same name already exists
      const existingCategory = await this._categoryRepository.findByName(categoryData.name);
      if (existingCategory) {
        throw new Error(`Category '${categoryData.name}' already exists`);
      }

      const createData = {
        name: categoryData.name,
        description: categoryData.description
      };

      return await this._categoryRepository.create(createData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create category');
    }
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    try {
      return await this._categoryRepository.findById(id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get category');
    }
  }

  async getCategoryByName(name: string): Promise<ICategory | null> {
    try {
      return await this._categoryRepository.findByName(name);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get category');
    }
  }

  async getAllCategories(): Promise<ICategory[]> {
    try {
      return await this._categoryRepository.findAll();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get categories');
    }
  }

  async getActiveCategories(): Promise<ICategory[]> {
    try {
      return await this._categoryRepository.findActive();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get active categories');
    }
  }

  async updateCategory(id: string, updateData: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<ICategory | null> {
    try {
      // Check if category exists
      const existingCategory = await this._categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }


      // Check if new name conflicts with existing category
      if (updateData.name && updateData.name !== existingCategory.name) {
        const nameConflict = await this._categoryRepository.findByName(updateData.name);
        if (nameConflict) {
          throw new Error(`Category '${updateData.name}' already exists`);
        }
      }

      return await this._categoryRepository.update(id, updateData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update category');
    }
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    try {
      return await this._categoryRepository.delete(id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete category');
    }
  }

}
