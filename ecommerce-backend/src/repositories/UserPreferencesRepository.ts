import { UserPreferences, IUserPreferences } from '../models/UserPreferences';
import { BaseRepository } from './BaseRepository';
import mongoose from 'mongoose';

export class UserPreferencesRepository extends BaseRepository<IUserPreferences> {
  constructor() {
    super(UserPreferences);
  }

  async findByUserId(userId: string): Promise<IUserPreferences | null> {
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      return this.findOne({ userId: objectId });
    } catch (error) {
      console.error('Invalid userId format:', userId, error);
      return null;
    }
  }

  async createOrUpdate(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserPreferences> {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      return this.update(existing._id.toString(), preferences) as Promise<IUserPreferences>;
    }
    
    console.log('Creating new preferences for user:', userId);
    const objectId = new mongoose.Types.ObjectId(userId);
    return this.create({ userId: objectId, ...preferences });
  }

  async updateByUserId(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserPreferences | null> {
    const existing = await this.findByUserId(userId);
    
    if (!existing) {
      console.log('No existing preferences found, creating new for user:', userId);
      const objectId = new mongoose.Types.ObjectId(userId);
      return this.create({ userId: objectId, ...preferences });
    }
    
    console.log('Updating existing preferences for user:', userId, 'with data:', preferences);
    return this.update(existing._id.toString(), preferences);
  }

  async deleteByUserId(userId: string): Promise<IUserPreferences | null> {
    const existing = await this.findByUserId(userId);
    
    if (!existing) {
      return null;
    }
    
    return this.delete(existing._id.toString());
  }
}