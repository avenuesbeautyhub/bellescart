import { IUserPreferences } from '../../models/UserPreferences';

export interface IUserPreferencesRepository {
  findByUserId(userId: string): Promise<IUserPreferences | null>;
  createOrUpdate(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserPreferences>;
  updateByUserId(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserPreferences | null>;
  deleteByUserId(userId: string): Promise<IUserPreferences | null>;
}