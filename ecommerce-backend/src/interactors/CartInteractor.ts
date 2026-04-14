import { ICartInteractor } from '../providers/interfaces/ICartInteractor';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { ICart, ICartItem } from '../models/Cart';
import { IProduct } from '../models/Product';

export class CartInteractor implements ICartInteractor {
  private _cartRepository: ICartRepository;
  private _productRepository: IProductRepository;

  constructor(cartRepository: ICartRepository, productRepository: IProductRepository) {
    this._cartRepository = cartRepository;
    this._productRepository = productRepository;
  }

  async getCart(userId: string): Promise<ICart> {
    let cart = await this._cartRepository.findByUserWithProducts(userId);

    if (!cart) {
      cart = await this._cartRepository.createOrUpdateCart(userId);
    }

    return cart;
  }

  async addToCart(userId: string, itemData: {
    productId: string;
    quantity: number;
  }): Promise<ICart> {
    // Check if product exists and is active
    const product = await this._productRepository.findByIdActive(itemData.productId);
    if (!product) {
      throw new Error('Product not found or not available');
    }

    // Check stock
    if (product.quantity < itemData.quantity) {
      throw new Error('Insufficient stock');
    }

    // Use base price (no variants in simplified model)
    let price = product.price;

    const cartItem: Omit<ICartItem, 'addedAt'> = {
      product: product._id,
      quantity: itemData.quantity,
      price,
      total: price * itemData.quantity
    };

    const cart = await this._cartRepository.addItem(userId, cartItem);
    if (!cart) {
      throw new Error('Failed to add item to cart');
    }

    return await this._cartRepository.findByUserWithProducts(userId) || cart;
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<ICart> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(item => item._id?.toString() === itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    // Check stock
    const product = await this._productRepository.findById(item.product.toString());
    if (product && product.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    const updatedCart = await this._cartRepository.updateItemQuantity(userId, itemId, quantity);
    if (!updatedCart) {
      throw new Error('Failed to update cart item');
    }

    return await this._cartRepository.findByUserWithProducts(userId) || updatedCart;
  }

  async removeFromCart(userId: string, itemId: string): Promise<ICart> {
    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(item => item._id?.toString() === itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    const updatedCart = await this._cartRepository.removeItem(userId, itemId);
    if (!updatedCart) {
      throw new Error('Failed to remove item from cart');
    }

    return await this._cartRepository.findByUserWithProducts(userId) || updatedCart;
  }

  async clearCart(userId: string): Promise<ICart> {
    const updatedCart = await this._cartRepository.clearCart(userId);
    if (!updatedCart) {
      throw new Error('Failed to clear cart');
    }

    return updatedCart;
  }

  async getCartTotal(userId: string): Promise<number> {
    return this._cartRepository.getCartTotal(userId);
  }

  async getCartItemCount(userId: string): Promise<number> {
    return this._cartRepository.getCartItemCount(userId);
  }

  async applyCoupon(userId: string, couponCode: string): Promise<ICart> {
    // This would integrate with a coupon service
    // For now, we'll implement a simple discount logic

    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Simple coupon logic (you can expand this)
    let discountAmount = 0;

    // Example: 10% off for coupon "SAVE10"
    if (couponCode === 'SAVE10') {
      discountAmount = cart.subtotal * 0.1;
    }
    // Example: $5 off for coupon "SAVE5"
    else if (couponCode === 'SAVE5') {
      discountAmount = 5;
    }
    // Example: Free shipping for coupon "FREESHIP"
    else if (couponCode === 'FREESHIP') {
      discountAmount = cart.shipping;
    }
    else {
      throw new Error('Invalid coupon code');
    }

    const updatedCart = await this._cartRepository.applyCoupon(userId, couponCode, discountAmount);
    if (!updatedCart) {
      throw new Error('Failed to apply coupon');
    }

    return await this._cartRepository.findByUserWithProducts(userId) || updatedCart;
  }

  async removeCoupon(userId: string): Promise<ICart> {
    const updatedCart = await this._cartRepository.removeCoupon(userId);
    if (!updatedCart) {
      throw new Error('Failed to remove coupon');
    }

    return await this._cartRepository.findByUserWithProducts(userId) || updatedCart;
  }

  async isProductInCart(userId: string, productId: string): Promise<boolean> {
    return this._cartRepository.isProductInCart(userId, productId);
  }

  async validateCartItems(userId: string): Promise<{
    valid: boolean;
    invalidItems: Array<{ itemId: string; reason: string }>;
    updatedCart?: ICart;
  }> {
    const cart = await this._cartRepository.findByUserWithProducts(userId);
    if (!cart) {
      return { valid: true, invalidItems: [] };
    }

    const invalidItems: Array<{ itemId: string; reason: string }> = [];
    let needsUpdate = false;

    for (const item of cart.items) {
      const product = (item.product as any) as IProduct;

      // Check if product is still active
      if (product.status !== 'active') {
        invalidItems.push({
          itemId: item._id!.toString(),
          reason: 'Product is no longer available'
        });
        needsUpdate = true;
        continue;
      }

      // Check stock
      if (product.quantity < item.quantity) {
        invalidItems.push({
          itemId: item._id!.toString(),
          reason: 'Insufficient stock'
        });
        needsUpdate = true;
      }

      // Check if price has changed
      if (product.price !== item.price) {
        invalidItems.push({
          itemId: item._id!.toString(),
          reason: 'Price has changed'
        });
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      // Remove invalid items from cart
      for (const invalidItem of invalidItems) {
        await this._cartRepository.removeItem(userId, invalidItem.itemId);
      }

      const updatedCart = await this._cartRepository.findByUserWithProducts(userId);
      return { valid: false, invalidItems, updatedCart: updatedCart || undefined };
    }

    return { valid: true, invalidItems };
  }

  async mergeGuestCart(userId: string, guestCartItems: ICartItem[]): Promise<ICart> {
    let cart = await this._cartRepository.createOrUpdateCart(userId);

    for (const guestItem of guestCartItems) {
      // Check if product is still valid
      const product = await this._productRepository.findByIdActive(guestItem.product.toString());
      if (!product) continue;

      // Check stock
      if (product.quantity < guestItem.quantity) {
        continue;
      }

      // Add item to user cart
      await this.addToCart(userId, {
        productId: guestItem.product.toString(),
        quantity: guestItem.quantity
      });
    }

    const finalCart = await this._cartRepository.findByUserWithProducts(userId);
    if (finalCart) {
      return finalCart;
    }
    return cart;
  }
}
