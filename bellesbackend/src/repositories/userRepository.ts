import { IUser, User } from '@/entities/userEntity';

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  updateById(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteById(id: string): Promise<boolean>;
  findAll(limit?: number, skip?: number): Promise<IUser[]>;
  count(): Promise<number>;
}

export class UserRepository implements IUserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async updateById(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { ...updateData, email: updateData.email?.toLowerCase() },
      { new: true, runValidators: true }
    ).select('-password');
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(limit = 10, skip = 0): Promise<IUser[]> {
    return User.find({})
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
  }

  async count(): Promise<number> {
    return User.countDocuments();
  }
}
