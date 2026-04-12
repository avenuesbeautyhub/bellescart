import { SignupData, LoginData, OtpData, ResendOtpData, ApiResponse } from '@/types/auth';
import { appConfig } from '@/config/appConfig';

export class AuthMockService {
  async mockSignup(data: SignupData): Promise<ApiResponse> {
    if (appConfig.enableLogging) {
      console.log('Mock signup:', data);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'OTP sent successfully',
      data: {
        email: data.email,
        step: 'otp_sent'
      }
    };
  }

  async mockVerifyOtp(data: OtpData): Promise<ApiResponse> {
    if (appConfig.enableLogging) {
      console.log('Mock verify OTP:', data);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful verification for demo
    if (data.otp === '123456') {
      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: '1',
            name: `${data.email.split('@')[0]}`,
            email: data.email,
            role: 'user',
            avatar: '',
            phone: ''
          },
          token: 'mock-jwt-access-token',
          refreshToken: 'mock-jwt-refresh-token'
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid OTP. Please check and try again.'
      };
    }
  }

  async mockResendOtp(data: ResendOtpData): Promise<ApiResponse> {
    if (appConfig.enableLogging) {
      console.log('Mock resend OTP:', data);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'OTP resent successfully',
      data: {
        email: data.email,
        step: 'otp_resent'
      }
    };
  }

  async mockLogin(data: LoginData): Promise<ApiResponse> {
    if (appConfig.enableLogging) {
      console.log('Mock login:', data);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful login for demo
    if (data.email === 'test@example.com' && data.password === 'password123') {
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: data.email,
            role: 'user',
            avatar: '',
            phone: '+1234567890'
          },
          token: 'mock-jwt-access-token',
          refreshToken: 'mock-jwt-refresh-token'
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
  }
}
