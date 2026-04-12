import { IProduct, Product } from '@/entities/productEntity';
import { IProductQuery } from '@/dto/requestDTO/productDTO';

export interface IProductRepository {
  create(productData: Partial<IProduct>): Promise<IProduct>;
  findById(id: string): Promise<IProduct | null>;
  findByIds(ids: string[]): Promise<IProduct[]>;
  updateById(id: string, updateData: Partial<IProduct>): Promise<IProduct | null>;
  deleteById(id: string): Promise<boolean>;
  findMany(query: IProductQuery): Promise<{ products: IProduct[]; total: number }>;
  findByCategory(categoryId: string): Promise<IProduct[]>;
  searchProducts(searchTerm: string, limit?: number): Promise<IProduct[]>;
  updateStock(id: string, quantity: number): Promise<IProduct | null>;
  getPopularProducts(limit?: number): Promise<IProduct[]>;
}

export class ProductRepository implements IProductRepository {
  async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return product.save();
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id).populate('category');
  }

  async findByIds(ids: string[]): Promise<IProduct[]> {
    return Product.find({ _id: { $in: ids }, isActive: true }).populate('category');
  }

  async updateById(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async findMany(query: IProductQuery): Promise<{ products: IProduct[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock
    } = query;

    const skip = (page - 1) * limit;
    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (inStock !== undefined) {
      filter.inStock = inStock;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .populate('category')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(filter);

    return { products, total };
  }

  async findByCategory(categoryId: string): Promise<IProduct[]> {
    return Product.find({ category: categoryId, isActive: true })
      .populate('category')
      .sort({ createdAt: -1 });
  }

  async searchProducts(searchTerm: string, limit = 10): Promise<IProduct[]> {
    return Product.find({
      $text: { $search: searchTerm },
      isActive: true
    })
      .populate('category')
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } });
  }

  async updateStock(id: string, quantity: number): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -quantity }, inStock: { $gt: 0 } },
      { new: true }
    );
  }

  async getPopularProducts(limit = 8): Promise<IProduct[]> {
    return Product.find({ isActive: true, inStock: true })
      .populate('category')
      .sort({ rating: -1, reviews: -1 })
      .limit(limit);
  }
}
