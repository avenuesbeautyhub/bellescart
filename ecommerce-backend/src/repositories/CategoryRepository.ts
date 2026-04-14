import { Category, ICategory } from '../models/Category';
import mongoose from 'mongoose';

export interface ICategoryRepository {
  create(categoryData: Partial<ICategory>): Promise<ICategory>;
  findById(id: string): Promise<ICategory | null>;
  findByName(name: string): Promise<ICategory | null>;
  findAll(): Promise<ICategory[]>;
  findActive(): Promise<ICategory[]>;
  update(id: string, updateData: Partial<ICategory>): Promise<ICategory | null>;
  delete(id: string): Promise<ICategory | null>;
}

export class CategoryRepository implements ICategoryRepository {
  async create(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(categoryData);
    return await category.save();
  }

  async findById(id: string): Promise<ICategory | null> {
    return await Category.findById(id);
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({ name, isActive: true });
  }

  async findAll(): Promise<ICategory[]> {
    return await Category.find().sort({ name: 1 });
  }

  async findActive(): Promise<ICategory[]> {
    return await Category.find({ isActive: true }).sort({ name: 1 });
  }

  async update(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<ICategory | null> {
    return await Category.findByIdAndDelete(id);
  }

}
