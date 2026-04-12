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

  async searchProducts(query: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]> {
    const searchFilter = {
      status: 'active',
      $text: { $search: query }
    };

    return this.find(searchFilter, options);
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
      sort: { 'rating.average': -1, createdAt: -1 }
    });
  }

  async updateInventory(productId: string, quantity: number): Promise<IProduct | null> {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { 'inventory.quantity': quantity } },
      { new: true }
    );
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.model.findById(productId);
    if (!product || !product.inventory.trackQuantity) {
      return true;
    }
    return product.inventory.quantity >= quantity;
  }

  async updateRating(productId: string, rating: number): Promise<IProduct | null> {
    const product = await this.model.findById(productId);
    if (!product) return null;

    const newCount = product.rating.count + 1;
    const newAverage = ((product.rating.average * product.rating.count) + rating) / newCount;

    return this.model.findByIdAndUpdate(
      productId,
      {
        $set: {
          'rating.average': newAverage,
          'rating.count': newCount
        }
      },
      { new: true }
    );
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
