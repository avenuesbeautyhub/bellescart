import { Cart, ICart, ICartItem } from '../models/Cart';
import { BaseRepository } from './BaseRepository';
import { ICartRepository } from '../providers/interfaces/ICartRepository';
import { Types } from 'mongoose';

export class CartRepository extends BaseRepository<ICart> implements ICartRepository {
  constructor() {
    super(Cart);
  }

  async findByUser(userId: string): Promise<ICart | null> {
    return this.findOne({ user: userId });
  }

  async findByUserWithProducts(userId: string): Promise<ICart | null> {
    return this.model.findOne({ user: userId }).populate('items.product');
  }

  async createOrUpdateCart(userId: string): Promise<ICart> {
    let cart = await this.findByUser(userId);

    if (!cart) {
      cart = await this.create({ user: new Types.ObjectId(userId), items: [] });
    }

    return cart;
  }

  async addItem(userId: string, item: Omit<ICartItem, 'addedAt'>): Promise<ICart | null> {
    const cart = await this.createOrUpdateCart(userId);

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(cartItem =>
      cartItem.product.toString() === item.product.toString() &&
      JSON.stringify(cartItem.variant) === JSON.stringify(item.variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        ...item,
        addedAt: new Date()
      });
    }

    return cart.save();
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
    if (itemIndex === -1) return null;

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;

    return cart.save();
  }

  async removeItem(userId: string, itemId: string): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    cart.items = cart.items.filter(item => item._id?.toString() !== itemId);
    return cart.save();
  }

  async clearCart(userId: string): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    cart.items = [];
    return cart.save();
  }

  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.findByUser(userId);
    return cart ? cart.total : 0;
  }

  async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.findByUser(userId);
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  async applyCoupon(userId: string, couponCode: string, discountAmount: number): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    cart.couponCode = couponCode;
    cart.couponDiscount = discountAmount;

    return cart.save();
  }

  async removeCoupon(userId: string): Promise<ICart | null> {
    const cart = await this.findByUser(userId);
    if (!cart) return null;

    cart.couponCode = undefined;
    cart.couponDiscount = 0;

    return cart.save();
  }

  async isProductInCart(userId: string, productId: string): Promise<boolean> {
    const cart = await this.findByUser(userId);
    if (!cart) return false;

    return cart.items.some(item => item.product.toString() === productId);
  }

  async getExpiredCarts(): Promise<ICart[]> {
    return this.find({
      expiresAt: { $lt: new Date() },
      items: { $gt: [] }
    });
  }

  async deleteExpiredCarts(): Promise<{ deletedCount: number }> {
    return this.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}
