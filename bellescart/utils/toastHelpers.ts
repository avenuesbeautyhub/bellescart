import { ToastMessage } from '@/components/ui/Toast';

export const toastMessages = {
  // Authentication messages
  auth: {
    loginSuccess: (userName?: string): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title: 'Login Successful!',
      message: `Welcome back${userName ? `, ${userName}` : ''}!`,
      duration: 3000
    }),
    loginError: (error?: string): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Login Failed',
      message: error || 'Invalid email or password',
      duration: 5000
    }),
    signupSuccess: (): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title: 'Account Created!',
      message: 'OTP sent to your email. Please check your inbox.',
      duration: 3000
    }),
    signupError: (error?: string): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Registration Failed',
      message: error || 'Failed to create account. Please try again.',
      duration: 5000
    }),
    otpVerified: (): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title: 'Email Verified!',
      message: 'Your account has been successfully created.',
      duration: 3000
    }),
    otpError: (error?: string): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Verification Failed',
      message: error || 'Invalid or expired OTP',
      duration: 5000
    }),
    otpResent: (): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title: 'OTP Resent',
      message: 'New OTP has been sent to your email.',
      duration: 3000
    }),
    logoutSuccess: (): Omit<ToastMessage, 'id'> => ({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
      duration: 3000
    }),
    tokenExpired: (): Omit<ToastMessage, 'id'> => ({
      type: 'info',
      title: 'Session Expired',
      message: 'Your session has expired. Refreshing automatically...',
      duration: 3000
    }),
    tokenRefreshFailed: (): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Session Expired',
      message: 'Please login again to continue.',
      duration: 5000
    }),
    tokenInvalid: (): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Authentication Failed',
      message: 'Invalid session. Please login again.',
      duration: 5000
    }),
    tokenRefreshed: (): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title: 'Session Refreshed',
      message: 'Your session has been automatically refreshed.',
      duration: 2000
    })
  },

  // Profile messages
  profile: {
    updateSuccess: (): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      duration: 3000
    }),
    updateError: (error?: string): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Update Failed',
      message: error || 'Failed to update profile',
      duration: 5000
    }),
    loadError: (): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Profile Error',
      message: 'Failed to load profile data',
      duration: 5000
    })
  },

  // General messages
  general: {
    networkError: (): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Network Error',
      message: 'Something went wrong. Please check your connection and try again.',
      duration: 5000
    }),
    unexpectedError: (): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
      duration: 5000
    }),
    success: (title: string, message?: string): Omit<ToastMessage, 'id'> => ({
      type: 'success',
      title,
      message: message || 'Operation completed successfully',
      duration: 3000
    }),
    error: (title: string, message?: string): Omit<ToastMessage, 'id'> => ({
      type: 'error',
      title,
      message: message || 'Operation failed',
      duration: 5000
    }),
    info: (title: string, message?: string): Omit<ToastMessage, 'id'> => ({
      type: 'info',
      title,
      message: message || 'Information',
      duration: 4000
    }),
    warning: (title: string, message?: string): Omit<ToastMessage, 'id'> => ({
      type: 'warning',
      title,
      message: message || 'Warning',
      duration: 4000
    })
  }
};
