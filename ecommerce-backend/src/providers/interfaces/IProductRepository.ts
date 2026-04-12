import { IProduct } from '../../models/Product';

export interface IProductRepository {
  create(data: Partial<IProduct>): Promise<IProduct>;
  findById(id: string): Promise<IProduct | null>;
  findByIdActive(id: string): Promise<IProduct | null>;
  find(filter: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  findActive(filter: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  searchProducts(query: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  findByCategory(category: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  findByBrand(brand: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  findByPriceRange(minPrice: number, maxPrice: number, options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  findFeatured(limit?: number): Promise<IProduct[]>;
  updateInventory(productId: string, quantity: number): Promise<IProduct | null>;
  checkStock(productId: string, quantity: number): Promise<boolean>;
  updateRating(productId: string, rating: number): Promise<IProduct | null>;
  getProductsByTags(tags: string[], options?: { limit?: number; skip?: number; sort?: any }): Promise<IProduct[]>;
  getRelatedProducts(productId: string, limit?: number): Promise<IProduct[]>;
  count(filter: any): Promise<number>;
  update(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
  delete(id: string): Promise<IProduct | null>;
}
