import { PrivacyPreference, IPrivacyPreference } from '../models/PrivacyPreference';
import { BaseRepository } from './BaseRepository';
import { IPrivacyPreferenceRepository } from '../providers/interfaces/IPrivacyPreferenceRepository';

export class PrivacyPreferenceRepository extends BaseRepository<IPrivacyPreference> implements IPrivacyPreferenceRepository {
  constructor() {
    super(PrivacyPreference);
  }

  async findByUserId(userId: string): Promise<IPrivacyPreference | null> {
    return this.findOne({ userId });
  }

  async findByUserIdOrCreate(userId: string): Promise<IPrivacyPreference> {
    let preference = await this.findByUserId(userId);
    
    if (!preference) {
      // Create with conservative defaults for existing users
      preference = await this.create({
        userId: userId as any, // Type assertion for mongoose ObjectId
        marketingEmails: false,
        consentVersion: '2026-09-15'
      });
    }
    
    return preference;
  }

  async updateByUserId(userId: string, data: Partial<IPrivacyPreference>): Promise<IPrivacyPreference | null> {
    const preference = await this.findByUserId(userId);
    if (!preference) {
      return null;
    }
    return this.update(preference._id.toString(), data);
  }
}
