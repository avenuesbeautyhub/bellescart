import { IPrivacyRequest, PrivacyRequestStatus } from '../../models/PrivacyRequest';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IPrivacyRequestRepository {
  create(data: Partial<IPrivacyRequest>): Promise<IPrivacyRequest>;
  findById(id: string, options?: { populate?: string | any }): Promise<IPrivacyRequest | null>;
  findOne(filter: FilterQuery<IPrivacyRequest>): Promise<IPrivacyRequest | null>;
  find(filter: FilterQuery<IPrivacyRequest>, options?: { limit?: number; skip?: number; sort?: any; populate?: string | any }): Promise<IPrivacyRequest[]>;
  update(id: string, data: UpdateQuery<IPrivacyRequest>): Promise<IPrivacyRequest | null>;
  updateMany(filter: FilterQuery<IPrivacyRequest>, data: UpdateQuery<IPrivacyRequest>): Promise<{ modifiedCount: number }>;
  delete(id: string): Promise<IPrivacyRequest | null>;
  deleteMany(filter: FilterQuery<IPrivacyRequest>): Promise<{ deletedCount: number }>;
  count(filter: FilterQuery<IPrivacyRequest>): Promise<number>;
  findByUserId(userId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IPrivacyRequest[]>;
  findByIdAndUserId(id: string, userId: string): Promise<IPrivacyRequest | null>;
  updateStatus(id: string, status: PrivacyRequestStatus, additionalData?: Partial<IPrivacyRequest>): Promise<IPrivacyRequest | null>;
  findPendingByUserId(userId: string): Promise<IPrivacyRequest[]>;
  findRecentByUserId(userId: string, limit?: number): Promise<IPrivacyRequest[]>;
}
