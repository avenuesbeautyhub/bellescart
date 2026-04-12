import { ICart, ICartItem } from '../../models/Cart';

export interface ICartRepository {
  findByUser(userId: string): Promise<ICart | null>;
  findByUserWithProducts(userId: string): Promise<ICart | null>;
  createOrUpdateCart(userId: string): Promise<ICart>;
  addItem(userId: string, item: Omit<ICartItem, 'addedAt'>): Promise<ICart | null>;
  updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<ICart | null>;
  removeItem(userId: string, itemId: string): Promise<ICart | null>;
  clearCart(userId: string): Promise<ICart | null>;
  getCartTotal(userId: string): Promise<number>;
  getCartItemCount(userId: string): Promise<number>;
  applyCoupon(userId: string, couponCode: string, discountAmount: number): Promise<ICart | null>;
  removeCoupon(userId: string): Promise<ICart | null>;
  isProductInCart(userId: string, productId: string): Promise<boolean>;
  getExpiredCarts(): Promise<ICart[]>;
  deleteExpiredCarts(): Promise<{ deletedCount: number }>;
}
