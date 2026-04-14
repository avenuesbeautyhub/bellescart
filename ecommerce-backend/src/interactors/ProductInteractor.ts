import { IProductInteractor } from '../providers/interfaces/IProductInteractor';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { ICategoryInteractor } from '../providers/interfaces/ICategoryInteractor';
import { IProduct } from '../models/Product';
import mongoose from 'mongoose';

export class ProductInteractor implements IProductInteractor {
  private _productRepository: IProductRepository;
  private _categoryInteractor: ICategoryInteractor;

  constructor(productRepository: IProductRepository, categoryInteractor: ICategoryInteractor) {
    this._productRepository = productRepository;
    this._categoryInteractor = categoryInteractor;
  }

  async getProducts(filters: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    featured?: boolean;
  }): Promise<{ products: IProduct[]; pagination: any }> {
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
    } = filters;

    // Build query
    const query: any = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (featured !== undefined) query.featured = featured;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Sort options
    const sortOptions: any = {};
    const sortOrder = order === 'asc' ? 1 : -1;

    if (['name', 'price', 'createdAt', 'rating.average'].includes(sort)) {
      sortOptions[sort] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    let products: IProduct[];
    let total: number;

    if (search) {
      // Use text search
      products = await this._productRepository.searchProducts(search, {
        limit,
        skip,
        sort: sortOptions
      });
      total = await this._productRepository.count({ ...query, $text: { $search: search } });
    } else {
      // Regular query
      products = await this._productRepository.findActive(query, {
        limit,
        skip,
        sort: sortOptions
      });
      total = await this._productRepository.count(query);
    }

    return {
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async getProductById(id: string): Promise<IProduct | null> {
    try {
      return await this._productRepository.findById(id);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get product');
    }
  }

  async findByName(name: string): Promise<IProduct | null> {
    try {
      return await this._productRepository.findByName(name);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get product by name');
    }
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      throw new Error('Missing required product fields: name, description, price, category are required');
    }

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(productData.category.toString())) {
      throw new Error('Invalid category ID format');
    }

    // Validate category exists
    const category = await this._categoryInteractor.getCategoryById(productData.category.toString());
    if (!category) {
      throw new Error('Invalid category: Category not found');
    }

    // Set default values
    const finalProductData = {
      ...productData,
      category: new mongoose.Types.ObjectId(productData.category.toString()),
      quantity: productData.quantity || 1,
      status: productData.status || 'active',
      featured: productData.featured || false
    };

    return this._productRepository.create(finalProductData);
  }

  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    // Validate category if it's being updated
    if (updateData.category) {
      // Validate category ID format
      if (!mongoose.Types.ObjectId.isValid(updateData.category.toString())) {
        throw new Error('Invalid category ID format');
      }

      const category = await this._categoryInteractor.getCategoryById(updateData.category.toString());
      if (!category) {
        throw new Error('Invalid category: Category not found');
      }
      // Convert to ObjectId
      updateData.category = new mongoose.Types.ObjectId(updateData.category.toString());
    }

    return this._productRepository.update(id, updateData);
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return this._productRepository.delete(id);
  }

  async getFeaturedProducts(limit: number = 10): Promise<IProduct[]> {
    return this._productRepository.findFeatured(limit);
  }

  async getProductsByCategory(category: string, options: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ products: IProduct[]; pagination: any }> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = options;

    const sortOptions: any = {};
    const sortOrder = order === 'asc' ? 1 : -1;

    if (['name', 'price', 'createdAt', 'rating.average'].includes(sort)) {
      sortOptions[sort] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const products = await this._productRepository.findByCategory(category, {
      limit,
      skip,
      sort: sortOptions
    });

    const total = await this._productRepository.count({ category, status: 'active' });

    return {
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }

  async updateInventory(productId: string, quantity: number): Promise<IProduct | null> {
    return this._productRepository.updateQuantity(productId, quantity);
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    return this._productRepository.checkStock(productId, quantity);
  }

  async updateRating(productId: string, rating: number): Promise<IProduct | null> {
    return this._productRepository.updateRating(productId, rating);
  }

  async getRelatedProducts(productId: string, limit: number = 5): Promise<IProduct[]> {
    return this._productRepository.getRelatedProducts(productId, limit);
  }

  async searchProducts(query: string, options: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<{ products: IProduct[]; pagination: any }> {
    const { page = 1, limit = 20, sort = 'relevance', order = 'desc' } = options;

    let sortOptions: any = {};

    if (sort === 'relevance') {
      // Text search relevance is handled by MongoDB
      sortOptions = { score: { $meta: 'textScore' } };
    } else if (['name', 'price', 'createdAt', 'rating.average'].includes(sort)) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOptions[sort] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const products = await this._productRepository.searchProducts(query, {
      limit,
      skip,
      sort: sortOptions
    });

    const total = await this._productRepository.count({
      status: 'active',
      $text: { $search: query }
    });

    return {
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    };
  }
}
