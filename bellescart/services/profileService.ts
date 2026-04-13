import { ApiResponse, UserProfile } from '@/types/auth';
import { appConfig, isMockMode } from '@/config/appConfig';
import { ProfileMockService } from './mock/profileMockService';
import { apiGet, apiPut } from './apiInterceptor';
import { globalToast } from '@/utils/globalToast';

const API_BASE_URL = appConfig.apiBaseUrl;
const mockService = new ProfileMockService();

class ProfileService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile();
    }

    try {
      const response = await apiGet(`${API_BASE_URL}/auth/profile`);
      return response.json();
    } catch (error) {
      globalToast.profile.loadError();
      throw error;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockUpdateProfile(data);
    }

    try {
      const response = await apiPut(`${API_BASE_URL}/auth/profile`, data);
      const result = await response.json();

      if (result.success) {
        globalToast.profile.updateSuccess();
      }

      return result;
    } catch (error) {
      globalToast.profile.updateError(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    }
  }
}

export const profileService = new ProfileService();
