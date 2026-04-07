import { IProductRepository } from '@/repositories/productRepository';
import { ICategoryRepository } from '@/repositories/categoryRepository';
import { ICreateProductRequest, IUpdateProductRequest, IProductQuery } from '@/dto/requestDTO/productDTO';
import { ERROR_CODES } from '@/constants/errorCodes';

export interface IProductService {
  createProduct(productData: ICreateProductRequest): Promise<any>;
  getProductById(id: string): Promise<any>;
  getProducts(query: IProductQuery): Promise<{ products: any[]; pagination: any }>;
  updateProduct(id: string, updateData: IUpdateProductRequest): Promise<any>;
  deleteProduct(id: string): Promise<boolean>;
  getPopularProducts(limit?: number): Promise<any[]>;
  searchProducts(searchTerm: string, limit?: number): Promise<any[]>;
  getProductsByCategory(categoryId: string): Promise<any[]>;
}

export class ProductService implements IProductService {
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async createProduct(productData: ICreateProductRequest): Promise<any> {
    const category = await this.categoryRepository.findById(productData.category);
    if (!category) {
      throw new Error(ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    const product = await this.productRepository.create({
      ...productData,
      stock: productData.stock || 0,
      inStock: (productData.stock || 0) > 0
    });

    return this.productRepository.findById(product.id);
  }

  async getProductById(id: string): Promise<any> {
    const product = await this.productRepository.findById(id);
    if (!product || !product.isActive) {
      throw new Error(ERROR_CODES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async getProducts(query: IProductQuery): Promise<{ products: any[]; pagination: any }> {
    const { products, total } = await this.productRepository.findMany(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async updateProduct(id: string, updateData: IUpdateProductRequest): Promise<any> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (updateData.category) {
      const category = await this.categoryRepository.findById(updateData.category);
      if (!category) {
        throw new Error(ERROR_CODES.CATEGORY_NOT_FOUND);
      }
    }

    if (updateData.stock !== undefined) {
      updateData.inStock = updateData.stock > 0;
    }

    return this.productRepository.updateById(id, updateData);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    return this.productRepository.deleteById(id);
  }

  async getPopularProducts(limit = 8): Promise<any[]> {
    return this.productRepository.getPopularProducts(limit);
  }

  async searchProducts(searchTerm: string, limit = 10): Promise<any[]> {
    return this.productRepository.searchProducts(searchTerm, limit);
  }

  async getProductsByCategory(categoryId: string): Promise<any[]> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error(ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    return this.productRepository.findByCategory(categoryId);
  }
}
