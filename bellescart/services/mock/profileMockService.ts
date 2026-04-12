import { ApiResponse, UserProfile } from '@/types/auth';
import { appConfig } from '@/config/appConfig';

export class ProfileMockService {
  async mockGetProfile(token: string): Promise<ApiResponse<UserProfile>> {
    if (appConfig.enableLogging) {
      console.log('Mock get profile with token:', token);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        avatar: '',
        phone: '+1234567890'
      }
    };
  }

  async mockUpdateProfile(token: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    if (appConfig.enableLogging) {
      console.log('Mock update profile:', { token, data });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: '1',
        name: data.name || 'Test User',
        email: 'test@example.com',
        role: 'user',
        avatar: data.avatar || '',
        phone: data.phone || '+1234567890'
      }
    };
  }
}
