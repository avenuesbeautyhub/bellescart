import { ApiResponse, UserProfile, Address } from '@/types/auth';
import { appConfig, isMockMode } from '@/config/appConfig';
import { ProfileMockService } from './mock/profileMockService';
import { apiGet, apiPut, apiPost, apiDelete } from './apiInterceptor';
import { globalToast } from '@/utils/globalToast';

const API_BASE_URL = appConfig.apiBaseUrl;
const mockService = new ProfileMockService();

class ProfileService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile();
    }

    try {
      const response = await apiGet(`${API_BASE_URL}/profile`);
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
      const response = await apiPut(`${API_BASE_URL}/profile`, data);
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

  async addAddress(address: Address): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockUpdateProfile({ addresses: [address] });
    }

    try {
      const response = await apiPost(`${API_BASE_URL}/profile/addresses`, address);
      const result = await response.json();

      if (result.success) {
        globalToast.profile.updateSuccess();
      }

      return result;
    } catch (error) {
      globalToast.profile.updateError(error instanceof Error ? error.message : 'Failed to add address');
      throw error;
    }
  }

  async updateAddress(addressId: string, address: Address): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockUpdateProfile({ addresses: [address] });
    }

    try {
      const response = await apiPut(`${API_BASE_URL}/profile/addresses/${addressId}`, address);
      const result = await response.json();

      if (result.success) {
        globalToast.profile.updateSuccess();
      }

      return result;
    } catch (error) {
      globalToast.profile.updateError(error instanceof Error ? error.message : 'Failed to update address');
      throw error;
    }
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile();
    }

    try {
      const response = await apiDelete(`${API_BASE_URL}/profile/addresses/${addressId}`);
      const result = await response.json();

      if (result.success) {
        globalToast.profile.updateSuccess();
      }

      return result;
    } catch (error) {
      globalToast.profile.updateError(error instanceof Error ? error.message : 'Failed to delete address');
      throw error;
    }
  }

  async setDefaultAddress(addressId: string): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile();
    }

    try {
      const response = await apiPut(`${API_BASE_URL}/profile/addresses/${addressId}/default`);
      const result = await response.json();

      if (result.success) {
        globalToast.profile.updateSuccess();
      }

      return result;
    } catch (error) {
      globalToast.profile.updateError(error instanceof Error ? error.message : 'Failed to set default address');
      throw error;
    }
  }

  async uploadProfilePicture(file: File): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockUpdateProfile({ avatar: URL.createObjectURL(file) });
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/profile/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        globalToast.profile.updateSuccess();
      }

      return result;
    } catch (error) {
      globalToast.profile.updateError(error instanceof Error ? error.message : 'Failed to upload profile picture');
      throw error;
    }
  }
}

export const profileService = new ProfileService();
