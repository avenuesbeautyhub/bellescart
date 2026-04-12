import { IProductInteractor } from '../providers/interfaces/IProductInteractor';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { IProduct } from '../models/Product';

export class ProductInteractor implements IProductInteractor {
  private _productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this._productRepository = productRepository;
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
    return this._productRepository.findByIdActive(id);
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category || !productData.brand) {
      throw new Error('Missing required product fields');
    }

    // Generate SKU if not provided
    if (!productData.inventory?.sku) {
      const brand = productData.brand.replace(/\s+/g, '').toUpperCase();
      const name = productData.name.replace(/\s+/g, '').toUpperCase().substring(0, 8);
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      productData.inventory = {
        ...productData.inventory,
        sku: `${brand}-${name}-${random}`,
        quantity: productData.inventory?.quantity || 0,
        trackQuantity: productData.inventory?.trackQuantity ?? true,
        allowBackorder: productData.inventory?.allowBackorder ?? false
      };
    }

    return this._productRepository.create(productData);
  }

  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
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
    return this._productRepository.updateInventory(productId, quantity);
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
