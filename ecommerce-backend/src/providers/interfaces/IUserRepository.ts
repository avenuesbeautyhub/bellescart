import { IUser } from '../../models/User';

export interface IUserRepository {
  create(data: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findOne(filter: any): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null>;
  addToWishlist(userId: string, productId: string): Promise<IUser | null>;
  removeFromWishlist(userId: string, productId: string): Promise<IUser | null>;
  getWishlist(userId: string): Promise<IUser | null>;

}
