import { SignupData, LoginData, OtpData, ResendOtpData, ApiResponse, LoginResponse } from '@/types/auth';
import { appConfig, isMockMode } from '@/config/appConfig';
import { AuthMockService } from './mock/authMockService';

const API_BASE_URL = appConfig.apiBaseUrl;
const mockService = new AuthMockService();

class AuthService {
  // Token storage methods
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
  async signup(data: SignupData): Promise<ApiResponse> {
    if (isMockMode()) {
      return mockService.mockSignup(data);
    }

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
      }),
    });

    return response.json();
  }

  async verifyOtp(data: OtpData): Promise<ApiResponse> {
    if (isMockMode()) {
      const response = await mockService.mockVerifyOtp(data);
      if (response.success && response.data?.token && response.data?.refreshToken) {
        this.setTokens(response.data.token, response.data.refreshToken);
      }
      return response;
    }

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
    if (isMockMode()) {
      return mockService.mockResendOtp(data);
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {
    if (isMockMode()) {
      const response = await mockService.mockLogin(data);
      if (response.success && response.data?.token && response.data?.refreshToken) {
        this.setTokens(response.data.token, response.data.refreshToken);
      }
      return response as LoginResponse;
    }

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

  logout(): void {
    this.clearTokens();
  }
}

export const authService = new AuthService();
