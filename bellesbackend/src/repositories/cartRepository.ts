import { ICart, Cart, ICartItem } from '@/entities/cartEntity';

export interface ICartRepository {
  create(userId: string): Promise<ICart>;
  findByUserId(userId: string): Promise<ICart | null>;
  updateById(id: string, updateData: Partial<ICart>): Promise<ICart | null>;
  addItem(userId: string, item: ICartItem): Promise<ICart | null>;
  removeItem(userId: string, productId: string): Promise<ICart | null>;
  updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null>;
  clearCart(userId: string): Promise<ICart | null>;
  deleteById(id: string): Promise<boolean>;
}

export class CartRepository implements ICartRepository {
  async create(userId: string): Promise<ICart> {
    const cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    return cart.save();
  }

  async findByUserId(userId: string): Promise<ICart | null> {
    return Cart.findOne({ user: userId }).populate('items.product');
  }

  async updateById(id: string, updateData: Partial<ICart>): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('items.product');
  }

  async addItem(userId: string, item: ICartItem): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return this.create(userId);
    }

    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.product.toString() === item.product.toString()
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      cart.items.push(item);
    }

    return cart.save().then(savedCart => 
      Cart.findById(savedCart._id).populate('items.product')
    );
  }

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    return Cart.findOneAndUpdate(
      { user: userId, 'items.product': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    ).populate('items.product');
  }

  async clearCart(userId: string): Promise<ICart | null> {
    return Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 },
      { new: true }
    ).populate('items.product');
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Cart.findByIdAndDelete(id);
    return !!result;
  }
}
