import { ICartRepository } from '@/repositories/cartRepository';
import { IProductRepository } from '@/repositories/productRepository';
import { ICartItem } from '@/entities/cartEntity';
import { ERROR_CODES } from '@/constants/errorCodes';

export interface ICartService {
  getCart(userId: string): Promise<any>;
  addToCart(userId: string, productId: string, quantity: number, size?: string, color?: string): Promise<any>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<any>;
  removeFromCart(userId: string, productId: string): Promise<any>;
  clearCart(userId: string): Promise<any>;
  calculateDeliveryFee(totalAmount: number): number;
}

export class CartService implements ICartService {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository
  ) {}

  async getCart(userId: string): Promise<any> {
    let cart = await this.cartRepository.findByUserId(userId);
    
    if (!cart) {
      cart = await this.cartRepository.create(userId);
    }

    const totalAmount = this.calculateCartTotal(cart.items);
    const deliveryFee = this.calculateDeliveryFee(totalAmount);
    const finalAmount = totalAmount + deliveryFee;

    return {
      ...cart.toObject(),
      totalAmount,
      deliveryFee,
      finalAmount
    };
  }

  async addToCart(userId: string, productId: string, quantity: number, size?: string, color?: string): Promise<any> {
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new Error(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (!product.inStock || product.stock < quantity) {
      throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
    }

    const cartItem: ICartItem = {
      product: product.id,
      quantity,
      size,
      color,
      addedAt: new Date()
    };

    const cart = await this.cartRepository.addItem(userId, cartItem);
    if (!cart) {
      throw new Error(ERROR_CODES.CART_NOT_FOUND);
    }

    const totalAmount = this.calculateCartTotal(cart.items);
    const deliveryFee = this.calculateDeliveryFee(totalAmount);
    const finalAmount = totalAmount + deliveryFee;

    return {
      ...cart.toObject(),
      totalAmount,
      deliveryFee,
      finalAmount
    };
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<any> {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error(ERROR_CODES.CART_NOT_FOUND);
    }

    const cartItem = cart.items.find(item => item.product.toString() === productId);
    if (!cartItem) {
      throw new Error(ERROR_CODES.CART_ITEM_NOT_FOUND);
    }

    const product = await this.productRepository.findById(productId);
    if (!product || !product.inStock || product.stock < quantity) {
      throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
    }

    const updatedCart = await this.cartRepository.updateItemQuantity(userId, productId, quantity);
    if (!updatedCart) {
      throw new Error(ERROR_CODES.CART_NOT_FOUND);
    }

    const totalAmount = this.calculateCartTotal(updatedCart.items);
    const deliveryFee = this.calculateDeliveryFee(totalAmount);
    const finalAmount = totalAmount + deliveryFee;

    return {
      ...updatedCart.toObject(),
      totalAmount,
      deliveryFee,
      finalAmount
    };
  }

  async removeFromCart(userId: string, productId: string): Promise<any> {
    const cart = await this.cartRepository.removeItem(userId, productId);
    if (!cart) {
      throw new Error(ERROR_CODES.CART_NOT_FOUND);
    }

    const totalAmount = this.calculateCartTotal(cart.items);
    const deliveryFee = this.calculateDeliveryFee(totalAmount);
    const finalAmount = totalAmount + deliveryFee;

    return {
      ...cart.toObject(),
      totalAmount,
      deliveryFee,
      finalAmount
    };
  }

  async clearCart(userId: string): Promise<any> {
    const cart = await this.cartRepository.clearCart(userId);
    if (!cart) {
      throw new Error(ERROR_CODES.CART_NOT_FOUND);
    }

    return {
      ...cart.toObject(),
      totalAmount: 0,
      deliveryFee: 0,
      finalAmount: 0
    };
  }

  calculateDeliveryFee(totalAmount: number): number {
    if (totalAmount < 499) {
      return 40;
    } else if (totalAmount <= 1000) {
      return 20;
    } else {
      return 0;
    }
  }

  private calculateCartTotal(items: any[]): number {
    return items.reduce((total, item) => {
      if (item.product && typeof item.product === 'object' && item.product.price) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  }
}
