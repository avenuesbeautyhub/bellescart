import { ICategory } from '../../models/Category';

export interface ICategoryRepository {
  create(categoryData: Partial<ICategory>): Promise<ICategory>;
  findById(id: string): Promise<ICategory | null>;
  findByName(name: string): Promise<ICategory | null>;
  findAll(): Promise<ICategory[]>;
  findActive(): Promise<ICategory[]>;
  update(id: string, updateData: Partial<ICategory>): Promise<ICategory | null>;
  delete(id: string): Promise<ICategory | null>;
  findByParent(parentId: string): Promise<ICategory[]>;
}
