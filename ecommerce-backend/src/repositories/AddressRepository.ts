import { Address, IAddress } from '../models/Address';
import { BaseRepository } from './BaseRepository';

export class AddressRepository extends BaseRepository<IAddress> {
  constructor() {
    super(Address);
  }

  async findByUserId(userId: string): Promise<IAddress[]> {
    return this.model.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async findByUserIdAndId(userId: string, addressId: string): Promise<IAddress | null> {
    return this.model.findOne({ _id: addressId, userId });
  }

  async createForUser(userId: string, addressData: Partial<IAddress>): Promise<IAddress> {
    return this.model.create({ ...addressData, userId });
  }

  async updateAddress(addressId: string, addressData: Partial<IAddress>): Promise<IAddress | null> {
    return this.model.findByIdAndUpdate(addressId, addressData, { new: true });
  }

  async deleteAddress(addressId: string): Promise<IAddress | null> {
    return this.model.findByIdAndDelete(addressId);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    // First, set all addresses for this user to non-default
    await this.model.updateMany({ userId }, { isDefault: false });
    // Then set the specific address as default
    await this.model.findByIdAndUpdate(addressId, { isDefault: true });
  }

  async getDefaultAddress(userId: string): Promise<IAddress | null> {
    return this.model.findOne({ userId, isDefault: true });
  }
}
