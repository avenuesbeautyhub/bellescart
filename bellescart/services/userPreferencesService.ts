import { ApiResponse, UserPreferences } from '@/types/auth';
import { isMockMode, getApiBaseUrl } from '@/config/appConfig';
import { apiGet, apiPut, apiPost, apiDelete } from './apiInterceptor';
import { globalToast } from '@/utils/globalToast';

class UserPreferencesService {
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiGet(`${getApiBaseUrl()}/preferences`);

      // Clone the response before reading to prevent "body stream already read" errors
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();

      return result;
    } catch (error) {
      console.error('Get preferences error:', error);
      globalToast.general.error('Error', 'Failed to load preferences');
      throw error;
    }
  }

  async updatePreferences(data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      console.log('Sending update preferences request:', data);
      const response = await apiPut(`${getApiBaseUrl()}/preferences`, data);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response ok:', response.ok);

      // Clone the response before reading to prevent "body stream already read" errors
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();
      console.log('Update preferences response parsed successfully:', result);

      return result;
    } catch (error) {
      console.error('Update preferences error:', error);
      globalToast.general.error('Error', 'Failed to update preferences');
      throw error;
    }
  }

  async resetPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiPost(`${getApiBaseUrl()}/preferences/reset`, {});

      // Clone the response before reading to prevent "body stream already read" errors
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();

      if (result.success) {
        globalToast.general.success('Preferences reset to default');
      }

      return result;
    } catch (error) {
      console.error('Reset preferences error:', error);
      globalToast.general.error('Error', 'Failed to reset preferences');
      throw error;
    }
  }

  async deletePreferences(): Promise<ApiResponse<void>> {
    try {
      const response = await apiDelete(`${getApiBaseUrl()}/preferences`);

      // Clone the response before reading to prevent "body stream already read" errors
      const clonedResponse = response.clone();
      const result = await clonedResponse.json();

      if (result.success) {
        globalToast.general.success('Preferences deleted');
      }

      return result;
    } catch (error) {
      console.error('Delete preferences error:', error);
      globalToast.general.error('Error', 'Failed to delete preferences');
      throw error;
    }
  }
}

export const userPreferencesService = new UserPreferencesService();