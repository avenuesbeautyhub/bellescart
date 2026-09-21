import { SignupData, LoginData, OtpData, ResendOtpData, ApiResponse, LoginResponse, UserProfile } from '@/types/auth';
import { appConfig, isMockMode } from '@/config/appConfig';
import { apiFetch, publicApiFetch } from './apiInterceptor';



const API_BASE_URL = appConfig.apiBaseUrl;
const MOCK_MODE = process.env.ENABLE_MOCK_DATA;

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


    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        otp: parseInt(data.otp),
      }),
    });

    const result = await response.json();

    // Store tokens if OTP verification is successful
    if (result.success && result.data?.token && result.data?.refreshToken) {
      this.setTokens(result.data.token, result.data.refreshToken);
    }

    return result;
  }

  async resendOtp(data: ResendOtpData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {


    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('login response', response);

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
      console.error('No refresh token available in localStorage');
      throw new Error('No refresh token available');
    }

    console.log('Attempting to refresh token with:', refreshToken.substring(0, 20) + '...');

    const response = await publicApiFetch('/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    console.log('Refresh token API response status:', response.status);

    const result = await response.json();

    console.log('Refresh token API response:', result);

    // Store new tokens if refresh is successful
    if (result.success && result.data?.token && result.data?.refreshToken) {
      this.setTokens(result.data.token, result.data.refreshToken);
      console.log('Tokens refreshed successfully');
    } else {
      console.error('Token refresh failed:', result);
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
    if (MOCK_MODE === 'true' || appConfig.useMockData) {
      return this.mockGetCurrentUser();
    }

    const response = await apiFetch(`${API_BASE_URL}/auth/findme`, {
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
