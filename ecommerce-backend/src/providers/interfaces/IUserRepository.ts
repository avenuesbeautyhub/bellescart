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
  addAddress(userId: string, address: IUser['addresses'][0]): Promise<IUser | null>;
  updateAddress(userId: string, addressIndex: number, address: Partial<IUser['addresses'][0]>): Promise<IUser | null>;
  removeAddress(userId: string, addressIndex: number): Promise<IUser | null>;
  setDefaultAddress(userId: string, addressIndex: number): Promise<IUser | null>;
}
