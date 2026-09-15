import { IUserPreferences } from '../../models/UserPreferences';

export interface IUserPreferencesInteractor {
  getPreferences(userId: string): Promise<IUserPreferences | null>;
  updatePreferences(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserPreferences>;
  resetPreferences(userId: string): Promise<IUserPreferences>;
  deletePreferences(userId: string): Promise<void>;
}