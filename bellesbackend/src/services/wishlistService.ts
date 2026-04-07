import { IWishlistRepository } from '@/repositories/wishlistRepository';
import { IProductRepository } from '@/repositories/productRepository';
import { ERROR_CODES } from '@/constants/errorCodes';

export interface IWishlistService {
  getWishlist(userId: string): Promise<any>;
  addToWishlist(userId: string, productId: string): Promise<any>;
  removeFromWishlist(userId: string, productId: string): Promise<any>;
  clearWishlist(userId: string): Promise<any>;
}

export class WishlistService implements IWishlistService {
  constructor(
    private wishlistRepository: IWishlistRepository,
    private productRepository: IProductRepository
  ) {}

  async getWishlist(userId: string): Promise<any> {
    let wishlist = await this.wishlistRepository.findByUserId(userId);
    
    if (!wishlist) {
      wishlist = await this.wishlistRepository.create(userId);
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<any> {
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new Error(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    const wishlist = await this.wishlistRepository.addItem(userId, productId);
    if (!wishlist) {
      throw new Error(ERROR_CODES.WISHLIST_NOT_FOUND);
    }

    return wishlist;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<any> {
    const wishlist = await this.wishlistRepository.removeItem(userId, productId);
    if (!wishlist) {
      throw new Error(ERROR_CODES.WISHLIST_NOT_FOUND);
    }

    return wishlist;
  }

  async clearWishlist(userId: string): Promise<any> {
    const wishlist = await this.wishlistRepository.clearWishlist(userId);
    if (!wishlist) {
      throw new Error(ERROR_CODES.WISHLIST_NOT_FOUND);
    }

    return wishlist;
  }
}
