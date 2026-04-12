import { ICart, ICartItem } from '../../models/Cart';

export interface ICartInteractor {
  getCart(userId: string): Promise<ICart>;
  addToCart(userId: string, itemData: {
    productId: string;
    variant?: { name: string; option: string };
    quantity: number;
  }): Promise<ICart>;
  updateCartItem(userId: string, itemId: string, quantity: number): Promise<ICart>;
  removeFromCart(userId: string, itemId: string): Promise<ICart>;
  clearCart(userId: string): Promise<ICart>;
  getCartTotal(userId: string): Promise<number>;
  getCartItemCount(userId: string): Promise<number>;
  applyCoupon(userId: string, couponCode: string): Promise<ICart>;
  removeCoupon(userId: string): Promise<ICart>;
  isProductInCart(userId: string, productId: string): Promise<boolean>;
  validateCartItems(userId: string): Promise<{
    valid: boolean;
    invalidItems: Array<{ itemId: string; reason: string }>;
    updatedCart?: ICart;
  }>;
  mergeGuestCart(userId: string, guestCartItems: ICartItem[]): Promise<ICart>;
}
