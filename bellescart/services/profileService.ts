import { ApiResponse, UserProfile } from '@/types/auth';
import { appConfig, isMockMode } from '@/config/appConfig';
import { ProfileMockService } from './mock/profileMockService';

const API_BASE_URL = appConfig.apiBaseUrl;
const mockService = new ProfileMockService();

class ProfileService {
  async getProfile(token: string): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile(token);
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }

  async updateProfile(token: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockUpdateProfile(token, data);
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }
}

export const profileService = new ProfileService();
