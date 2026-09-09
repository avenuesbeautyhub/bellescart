import { ICartInteractor } from '../providers/interfaces/ICartInteractor';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { IProductRepository } from '../providers/interfaces/IProductRepository';
import { ICouponInteractor } from '../providers/interfaces/ICouponInteractor';
import { ICart, ICartItem } from '../models/Cart';
import { IProduct } from '../models/Product';

export class CartInteractor implements ICartInteractor {
  private _cartRepository: ICartRepository;
  private _productRepository: IProductRepository;
  private _couponInteractor?: ICouponInteractor;

  constructor(cartRepository: ICartRepository, productRepository: IProductRepository, couponInteractor?: ICouponInteractor) {
    this._cartRepository = cartRepository;
    this._productRepository = productRepository;
    this._couponInteractor = couponInteractor;
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
    if (!this._couponInteractor) {
      throw new Error('Coupon service not available');
    }

    const cart = await this._cartRepository.findByUserWithProducts(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Get cart category if applicable (from first item's category)
    const cartCategory = cart.items.length > 0 ? (cart.items[0].product as any)?.category?.name : undefined;

    // Apply coupon using the coupon interactor
    const result = await this._couponInteractor.applyCoupon(
      couponCode,
      userId,
      cart.subtotal,
      cartCategory
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to apply coupon');
    }

    const updatedCart = await this._cartRepository.applyCoupon(userId, couponCode, result.discountAmount);
    if (!updatedCart) {
      throw new Error('Failed to apply coupon to cart');
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

  async validateCartStock(userId: string): Promise<{
    valid: boolean;
    outOfStockItems: Array<{ productId: string; productName: string; requestedQuantity: number; availableQuantity: number }>;
    message: string;
  }> {
    const cart = await this._cartRepository.findByUserWithProducts(userId);
    if (!cart || cart.items.length === 0) {
      return {
        valid: true,
        outOfStockItems: [],
        message: 'Cart is empty'
      };
    }

    const outOfStockItems: Array<{ productId: string; productName: string; requestedQuantity: number; availableQuantity: number }> = [];

    for (const item of cart.items) {
      const product = (item.product as any) as IProduct;
      
      // Check if product is still active
      if (product.status !== 'active') {
        outOfStockItems.push({
          productId: product._id.toString(),
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: 0
        });
        continue;
      }

      // Check stock
      if (product.quantity < item.quantity) {
        outOfStockItems.push({
          productId: product._id.toString(),
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: product.quantity
        });
      }
    }

    if (outOfStockItems.length > 0) {
      return {
        valid: false,
        outOfStockItems,
        message: `${outOfStockItems.length} item(s) in your cart are out of stock or have insufficient quantity`
      };
    }

    return {
      valid: true,
      outOfStockItems: [],
      message: 'All items are in stock'
    };
  }
}
