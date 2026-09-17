import { IUserPreferencesInteractor } from '../providers/interfaces/IUserPreferencesInteractor';
import { IUserPreferencesRepository } from '../providers/interfaces/IUserPreferencesRepository';
import { IUserPreferences } from '../models/UserPreferences';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserPreferencesInteractor');

export class UserPreferencesInteractor implements IUserPreferencesInteractor {
  private _preferencesRepository: IUserPreferencesRepository;

  constructor(preferencesRepository: IUserPreferencesRepository) {
    this._preferencesRepository = preferencesRepository;
  }

  async getPreferences(userId: string): Promise<IUserPreferences | null> {
    try {
      const preferences = await this._preferencesRepository.findByUserId(userId);
      
      if (!preferences) {
        logger.info(`No preferences found for user ${userId}, creating default preferences`);
        // Create default preferences
        const defaultPrefs = this.getDefaultPreferences(userId);
        const created = await this._preferencesRepository.createOrUpdate(userId, defaultPrefs);
        return created;
      }
      
      return preferences;
    } catch (error) {
      logger.error(`Error getting preferences for user ${userId}:`, error);
      throw error;
    }
  }

  async updatePreferences(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserPreferences> {
    try {
      logger.info(`Updating preferences for user ${userId}:`, preferences);
      
      const updatedPreferences = await this._preferencesRepository.updateByUserId(userId, preferences);
      
      if (!updatedPreferences) {
        logger.error(`Failed to update preferences for user ${userId} - update returned null`);
        throw new Error('Failed to update preferences');
      }
      
      logger.info(`Preferences updated successfully for user ${userId}:`, updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      logger.error(`Error updating preferences for user ${userId}:`, error);
      throw error;
    }
  }

  async resetPreferences(userId: string): Promise<IUserPreferences> {
    try {
      logger.info(`Resetting preferences to default for user ${userId}`);
      
      const defaultPreferences = this.getDefaultPreferences(userId);
      const resetPreferences = await this._preferencesRepository.createOrUpdate(userId, defaultPreferences);
      
      logger.info(`Preferences reset successfully for user ${userId}`);
      return resetPreferences;
    } catch (error) {
      logger.error(`Error resetting preferences for user ${userId}:`, error);
      throw error;
    }
  }

  async deletePreferences(userId: string): Promise<void> {
    try {
      logger.info(`Deleting preferences for user ${userId}`);
      
      await this._preferencesRepository.deleteByUserId(userId);
      
      logger.info(`Preferences deleted successfully for user ${userId}`);
    } catch (error) {
      logger.error(`Error deleting preferences for user ${userId}:`, error);
      throw error;
    }
  }

  private getDefaultPreferences(userId: string): Partial<IUserPreferences> {
    return {
      userId: userId as any, // Type assertion for mongoose ObjectId
      language: 'en',
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        sms: false,
        orderUpdates: true,
        promotions: true
      },
      privacy: {
        profileVisibility: 'private',
        showActivity: false
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false
      }
    };
  }
}