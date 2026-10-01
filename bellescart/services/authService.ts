import { SignupData, LoginData, OtpData, ResendOtpData, ApiResponse, LoginResponse, UserProfile } from '@/types/auth';
import { isMockMode } from '@/config/appConfig';
import { apiFetch, publicApiFetch } from './apiInterceptor';
import { logger } from '@/utils/logger';



const MOCK_MODE = process.env.ENABLE_MOCK_DATA;

// Helper function to check if mock mode is enabled
const shouldUseMock = () => {
  return MOCK_MODE === 'true' || isMockMode();
};

class AuthService {
  // Token storage methods - using same keys as auth context
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('bellescart_token', token);
    localStorage.setItem('bellescart_refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('bellescart_token');
    localStorage.removeItem('bellescart_refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('bellescart_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('bellescart_refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
  async signup(data: SignupData & { marketingConsent?: boolean; privacyPolicyConsent?: boolean }): Promise<ApiResponse> {


    const response = await publicApiFetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        phone: data.phone,
        marketingConsent: data.marketingConsent || false,
        privacyPolicyConsent: data.privacyPolicyConsent || false,
      }),
    });

    return response.json();
  }

  async verifyOtp(data: OtpData): Promise<ApiResponse> {
    logger.auth('Verifying OTP for email:', data.email);

    const response = await publicApiFetch('/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        otp: parseInt(data.otp),
      }),
    });

    logger.auth('OTP verification response status:', response.status);

    const result = await response.json();

    logger.auth('OTP verification response data:', result);

    // Store tokens if OTP verification is successful
    if (result.success && result.data?.token && result.data?.refreshToken) {
      this.setTokens(result.data.token, result.data.refreshToken);
      logger.auth('Tokens stored successfully after OTP verification');
    } else {
      logger.auth('OTP verification failed or no tokens in response');
    }

    return result;
  }

  async resendOtp(data: ResendOtpData): Promise<ApiResponse> {
    const response = await publicApiFetch('/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {


    const response = await publicApiFetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // Store tokens if login is successful
    if (result.success && result.data?.token && result.data?.refreshToken) {
      this.setTokens(result.data.token, result.data.refreshToken);
    }

    return result;
  }

  async refreshToken(): Promise<LoginResponse> {


    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      logger.error('No refresh token available in localStorage');
      throw new Error('No refresh token available');
    }

    logger.auth('Attempting to refresh token');

    const response = await publicApiFetch('/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    logger.auth('Refresh token API response status', response.status);

    const result = await response.json();

    logger.auth('Refresh token API response received');

    // Store new tokens if refresh is successful
    if (result.success && result.data?.token && result.data?.refreshToken) {
      this.setTokens(result.data.token, result.data.refreshToken);
      logger.auth('Tokens refreshed successfully');
    } else {
      logger.auth('Token refresh failed');
    }

    return result;
  }

  logout(): void {
    this.clearTokens();
    // Clear all user-related items from localStorage on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bellescart_theme');
      localStorage.removeItem('bellescart_language');
      localStorage.removeItem('bellescart_csrf_token');
      localStorage.removeItem('bellescart_user');
      localStorage.removeItem('bellescart_user_data');
      localStorage.removeItem('justLoggedIn');
      localStorage.removeItem('welcomeShown');
      // Dispatch auth state change event so providers know user logged out
      window.dispatchEvent(new Event('auth-state-changed'));
      window.dispatchEvent(new Event('storage'));
      window.location.href = '/login';
    }
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    // Check if mock mode is enabled
    if (shouldUseMock()) {
      return this.mockGetCurrentUser();
    }

    const response = await apiFetch('/auth/findme', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clone the response before reading to prevent "body stream already read" errors
    const clonedResponse = response.clone();
    const result = await clonedResponse.json();

    // Map backend _id to frontend id
    if (result.success && result.data) {
      result.data.id = result.data._id || result.data.id;
    }

    return result;
  }
  

  private mockGetCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: '69da04bfbab0408035d0987c',
          name: 'sample',
          email: 'string@gmail.com',
          phone: '2834793279',
          role: 'user'
        };

        resolve({
          success: true,
          message: 'Current user retrieved successfully',
          data: mockUser
        });
      }, 500); // Simulate network delay
    });
  }
}

export const authService = new AuthService();
