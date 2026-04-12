import { User, IUser } from '../models/User';
import { BaseRepository } from './BaseRepository';
import { IUserRepository } from '../providers/interfaces/IUserRepository';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select('+password');
  }

  async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    return this.update(userId, data);
  }

  async addToWishlist(userId: string, productId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );
  }

  async removeFromWishlist(userId: string, productId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );
  }

  async getWishlist(userId: string): Promise<IUser | null> {
    return this.model.findById(userId).populate('wishlist');
  }

  async addAddress(userId: string, address: IUser['addresses'][0]): Promise<IUser | null> {
    // If this is the default address, remove default from other addresses
    if (address.isDefault) {
      await this.model.updateMany(
        { _id: userId, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    return this.model.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true }
    );
  }

  async updateAddress(userId: string, addressIndex: number, address: Partial<IUser['addresses'][0]>): Promise<IUser | null> {
    const updateObj: any = {};

    Object.keys(address).forEach(key => {
      updateObj[`addresses.${addressIndex}.${key}`] = address[key as keyof typeof address];
    });

    return this.model.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true }
    );
  }

  async removeAddress(userId: string, addressIndex: number): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $unset: { [`addresses.${addressIndex}`]: 1 } },
      { new: true }
    );
  }

  async setDefaultAddress(userId: string, addressIndex: number): Promise<IUser | null> {
    // Remove default from all addresses
    await this.model.updateMany(
      { _id: userId },
      { $set: { 'addresses.$[].isDefault': false } }
    );

    // Set new default
    return this.model.findByIdAndUpdate(
      userId,
      { $set: { [`addresses.${addressIndex}.isDefault`]: true } },
      { new: true }
    );
  }
}
