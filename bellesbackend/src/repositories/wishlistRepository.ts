import { IWishlist, Wishlist, IWishlistItem } from '@/entities/wishlistEntity';

export interface IWishlistRepository {
  create(userId: string): Promise<IWishlist>;
  findByUserId(userId: string): Promise<IWishlist | null>;
  addItem(userId: string, productId: string): Promise<IWishlist | null>;
  removeItem(userId: string, productId: string): Promise<IWishlist | null>;
  clearWishlist(userId: string): Promise<IWishlist | null>;
  deleteById(id: string): Promise<boolean>;
}

export class WishlistRepository implements IWishlistRepository {
  async create(userId: string): Promise<IWishlist> {
    const wishlist = new Wishlist({ user: userId, items: [] });
    return wishlist.save();
  }

  async findByUserId(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOne({ user: userId }).populate('items.product');
  }

  async addItem(userId: string, productId: string): Promise<IWishlist | null> {
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await this.create(userId);
    }

    const existingItem = wishlist.items.find(
      (item: IWishlistItem) => item.product.toString() === productId
    );

    if (existingItem) {
      return wishlist;
    }

    wishlist.items.push({ product: productId, addedAt: new Date() });
    
    return wishlist.save().then(savedWishlist => 
      Wishlist.findById(savedWishlist._id).populate('items.product')
    );
  }

  async removeItem(userId: string, productId: string): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');
  }

  async clearWishlist(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    ).populate('items.product');
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Wishlist.findByIdAndDelete(id);
    return !!result;
  }
}
