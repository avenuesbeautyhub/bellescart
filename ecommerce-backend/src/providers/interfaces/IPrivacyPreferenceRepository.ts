import { IPrivacyPreference } from '../../models/PrivacyPreference';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IPrivacyPreferenceRepository {
  create(data: Partial<IPrivacyPreference>): Promise<IPrivacyPreference>;
  findById(id: string, options?: { populate?: string | any }): Promise<IPrivacyPreference | null>;
  findOne(filter: FilterQuery<IPrivacyPreference>): Promise<IPrivacyPreference | null>;
  find(filter: FilterQuery<IPrivacyPreference>, options?: { limit?: number; skip?: number; sort?: any; populate?: string | any }): Promise<IPrivacyPreference[]>;
  update(id: string, data: UpdateQuery<IPrivacyPreference>): Promise<IPrivacyPreference | null>;
  updateMany(filter: FilterQuery<IPrivacyPreference>, data: UpdateQuery<IPrivacyPreference>): Promise<{ modifiedCount: number }>;
  delete(id: string): Promise<IPrivacyPreference | null>;
  deleteMany(filter: FilterQuery<IPrivacyPreference>): Promise<{ deletedCount: number }>;
  count(filter: FilterQuery<IPrivacyPreference>): Promise<number>;
  findByUserId(userId: string): Promise<IPrivacyPreference | null>;
  findByUserIdOrCreate(userId: string): Promise<IPrivacyPreference>;
  updateByUserId(userId: string, data: Partial<IPrivacyPreference>): Promise<IPrivacyPreference | null>;
}
