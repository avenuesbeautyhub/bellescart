import { PrivacyRequest, IPrivacyRequest, PrivacyRequestStatus } from '../models/PrivacyRequest';
import { BaseRepository } from './BaseRepository';
import { IPrivacyRequestRepository } from '../providers/interfaces/IPrivacyRequestRepository';

export class PrivacyRequestRepository extends BaseRepository<IPrivacyRequest> implements IPrivacyRequestRepository {
  constructor() {
    super(PrivacyRequest);
  }

  async findByUserId(userId: string, options?: { limit?: number; skip?: number; sort?: any }): Promise<IPrivacyRequest[]> {
    return this.find({ userId }, options);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<IPrivacyRequest | null> {
    return this.findOne({ _id: id, userId });
  }

  async updateStatus(id: string, status: PrivacyRequestStatus, additionalData?: Partial<IPrivacyRequest>): Promise<IPrivacyRequest | null> {
    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }
    
    return this.update(id, updateData);
  }

  async findPendingByUserId(userId: string): Promise<IPrivacyRequest[]> {
    return this.find({ userId, status: 'pending' }, { sort: { createdAt: -1 } });
  }

  async findRecentByUserId(userId: string, limit: number = 10): Promise<IPrivacyRequest[]> {
    return this.find({ userId }, { sort: { createdAt: -1 }, limit });
  }
}
