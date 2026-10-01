import { ApiResponse, UserProfile, Address } from '@/types/auth';
import { appConfig, clientConfig, isMockMode, getApiBaseUrl } from '@/config/appConfig';
import { ProfileMockService } from './mock/profileMockService';
import { apiGet, apiPut, apiPost, apiDelete, apiFetch } from './apiInterceptor';
import { globalToast } from '@/utils/globalToast';

const mockService = new ProfileMockService();

class ProfileService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (isMockMode()) {
      return mockService.mockGetProfile();
    }

    try {
      const response = await apiGet(`${getApiBaseUrl()}/profile`);
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
      const response = await apiPut(`${getApiBaseUrl()}/profile`, data);
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
      const response = await apiPost(`${getApiBaseUrl()}/profile/addresses`, address);
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
      const response = await apiPut(`${getApiBaseUrl()}/profile/addresses/${addressId}`, address);
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
      const response = await apiDelete(`${getApiBaseUrl()}/profile/addresses/${addressId}`);
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
      const response = await apiPut(`${getApiBaseUrl()}/profile/addresses/${addressId}/default`);
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

      const token = localStorage.getItem('bellescart_token');

      // Get CSRF token from cookie
      const getCsrfTokenFromCookie = (): string | null => {
        if (typeof window === 'undefined') return null;
        const match = document.cookie.match(/(^|;) ?csrfToken=([^;]*)(;|$)/);
        return match ? match[2] : null;
      };

      const csrfToken = getCsrfTokenFromCookie();

      const response = await fetch(`/api/proxy/profile/profile-picture`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log('Profile picture upload response status:', response.status);
      const result = await response.json();
      console.log('Profile picture upload response data:', result);

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
