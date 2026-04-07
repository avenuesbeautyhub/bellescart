import { ICategory, Category } from '@/entities/categoryEntity';

export interface ICategoryRepository {
  create(categoryData: Partial<ICategory>): Promise<ICategory>;
  findById(id: string): Promise<ICategory | null>;
  findByName(name: string): Promise<ICategory | null>;
  findAll(): Promise<ICategory[]>;
  updateById(id: string, updateData: Partial<ICategory>): Promise<ICategory | null>;
  deleteById(id: string): Promise<boolean>;
}

export class CategoryRepository implements ICategoryRepository {
  async create(categoryData: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(categoryData);
    return category.save();
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById({ _id: id, isActive: true });
  }

  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name: new RegExp(`^${name}$`, 'i'), isActive: true });
  }

  async findAll(): Promise<ICategory[]> {
    return Category.find({ isActive: true }).sort({ name: 1 });
  }

  async updateById(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }
}
