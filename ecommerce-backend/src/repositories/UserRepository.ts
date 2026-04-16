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

 
}
