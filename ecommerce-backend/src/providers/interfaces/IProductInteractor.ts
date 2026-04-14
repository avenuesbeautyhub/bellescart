import { IProduct } from '../../models/Product';

export interface IProductInteractor {
  getProducts(filters: {
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
  }): Promise<{ products: IProduct[]; pagination: any }>;
  getProductById(id: string): Promise<IProduct | null>;
  findByName(name: string): Promise<IProduct | null>;
  createProduct(productData: Partial<IProduct>): Promise<IProduct>;
  updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct | null>;
  deleteProduct(id: string): Promise<IProduct | null>;
  getFeaturedProducts(limit?: number): Promise<IProduct[]>;
  getProductsByCategory(category: string, options?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ products: IProduct[]; pagination: any }>;
  updateInventory(productId: string, quantity: number): Promise<IProduct | null>;
  checkStock(productId: string, quantity: number): Promise<boolean>;
  updateRating(productId: string, rating: number): Promise<IProduct | null>;
  getRelatedProducts(productId: string, limit?: number): Promise<IProduct[]>;
  searchProducts(query: string, options?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ products: IProduct[]; pagination: any }>;
}
