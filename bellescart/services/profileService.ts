import { ApiResponse, UserProfile } from '@/types/auth';
import { appConfig, isMockMode } from '@/config/appConfig';
import { ProfileMockService } from './mock/profileMockService';
import { apiGet, apiPut } from './apiInterceptor';

const API_BASE_URL = appConfig.apiBaseUrl;
const mockService = new ProfileMockService();

class ProfileService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile();
    }

    const response = await apiGet(`${API_BASE_URL}/api/auth/profile`);
    return response.json();
  }

  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockUpdateProfile(data);
    }

    const response = await apiPut(`${API_BASE_URL}/api/auth/profile`, data);
    return response.json();
  }
}

export const profileService = new ProfileService();
