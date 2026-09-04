import { Product, IProduct } from '../models/Product';
import { BaseRepository } from './BaseRepository';
import { IProductRepository } from '../providers/interfaces/IProductRepository';

export class ProductRepository extends BaseRepository<IProduct> implements IProductRepository {
  constructor() {
    super(Product);
  }

  async findActive(filter: any = {}, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    return this.find({ ...filter, status: 'active' }, options);
  }

  async findByIdActive(id: string): Promise<IProduct | null> {
    return this.model.findOne({ _id: id, status: 'active' });
  }

  async findByName(name: string): Promise<IProduct | null> {
    return this.model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  }

  async searchProducts(query: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    // Create case-insensitive regex for better partial matching
    // Split query into words and search for each
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
      return this.findActive({}, options);
    }

    // Create regex patterns for each search term with word boundaries
    const regexPatterns = searchTerms.map(term => 
      new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    );

    const searchConditions = regexPatterns.map(pattern => ({
      $or: [
        { name: { $regex: pattern } },
        { description: { $regex: pattern } },
        { brand: { $regex: pattern } }
      ]
    }));

    const searchFilter = {
      status: 'active',
      $and: searchConditions
    };

    return this.find(searchFilter, options);
  }

  async countSearchResults(query: string): Promise<number> {
    // Create case-insensitive regex for better partial matching
    // Split query into words and search for each
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
      return this.model.countDocuments({ status: 'active' });
    }

    // Create regex patterns for each search term with word boundaries
    const regexPatterns = searchTerms.map(term => 
      new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    );

    const searchConditions = regexPatterns.map(pattern => ({
      $or: [
        { name: { $regex: pattern } },
        { description: { $regex: pattern } },
        { brand: { $regex: pattern } }
      ]
    }));

    const searchFilter = {
      status: 'active',
      $and: searchConditions
    };

    return this.model.countDocuments(searchFilter);
  }

  async findByCategory(category: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    return this.findActive({ category }, options);
  }

  async findByBrand(brand: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    return this.findActive({ brand }, options);
  }

  async findByPriceRange(minPrice: number, maxPrice: number, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    return this.findActive({
      price: { $gte: minPrice, $lte: maxPrice }
    }, options);
  }

  async findFeatured(limit: number = 10): Promise<IProduct[]> {
    return this.findActive({ featured: true }, {
      limit,
      sort: { createdAt: -1 }
    });
  }

  async updateQuantity(productId: string, quantity: number): Promise<IProduct | null> {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { quantity: -quantity } },
      { new: true }
    );
  }

  async checkStock(productId: string, requestedQuantity: number): Promise<boolean> {
    const product = await this.model.findById(productId);
    if (!product) return false;
    return product.quantity >= requestedQuantity;
  }

  // Legacy methods for interface compatibility
  async updateInventory(productId: string, quantity: number): Promise<IProduct | null> {
    return this.updateQuantity(productId, quantity);
  }

  async updateRating(productId: string, rating: number): Promise<IProduct | null> {
    // For now, just return the product without updating rating
    // Rating system can be implemented later if needed
    return this.model.findById(productId);
  }

  async getProductsByTags(tags: string[], options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    return this.findActive({ tags: { $in: tags } }, options);
  }

  async getRelatedProducts(productId: string, limit: number = 5): Promise<IProduct[]> {
    const product = await this.model.findById(productId);
    if (!product) return [];

    return this.findActive({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } }
      ]
    }, { limit, sort: { 'rating.average': -1 } });
  }
}
