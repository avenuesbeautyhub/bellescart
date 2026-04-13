// Global toast system that can be used outside React components
import { toastMessages } from './toastHelpers';

type ToastCallback = (toast: Omit<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string; duration?: number; }, 'id'>) => void;

let globalToastCallback: ToastCallback | null = null;

// Register the toast callback (called from ToastProvider)
export const registerToastCallback = (callback: ToastCallback) => {
  globalToastCallback = callback;
};

// Global toast functions that can be called from anywhere
export const globalToast = {
  show: (toast: Omit<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string; duration?: number; }, 'id'>) => {
    if (globalToastCallback) {
      globalToastCallback(toast);
    } else {
      // Fallback to console if toast system not ready
      console.log(`[${toast.type.toUpperCase()}] ${toast.title}: ${toast.message || ''}`);
    }
  },
  
  // Auth-specific toast functions
  auth: {
    tokenExpired: () => globalToast.show(toastMessages.auth.tokenExpired()),
    tokenRefreshFailed: () => globalToast.show(toastMessages.auth.tokenRefreshFailed()),
    tokenInvalid: () => globalToast.show(toastMessages.auth.tokenInvalid()),
    tokenRefreshed: () => globalToast.show(toastMessages.auth.tokenRefreshed()),
    logoutSuccess: () => globalToast.show(toastMessages.auth.logoutSuccess()),
  },
  
  // Profile toast functions
  profile: {
    updateSuccess: () => globalToast.show(toastMessages.profile.updateSuccess()),
    updateError: (error?: string) => globalToast.show(toastMessages.profile.updateError(error)),
    loadError: () => globalToast.show(toastMessages.profile.loadError()),
  },
  
  // General toast functions
  general: {
    networkError: () => globalToast.show(toastMessages.general.networkError()),
    unexpectedError: () => globalToast.show(toastMessages.general.unexpectedError()),
    success: (title: string, message?: string) => globalToast.show(toastMessages.general.success(title, message)),
    error: (title: string, message?: string) => globalToast.show(toastMessages.general.error(title, message)),
    info: (title: string, message?: string) => globalToast.show(toastMessages.general.info(title, message)),
    warning: (title: string, message?: string) => globalToast.show(toastMessages.general.warning(title, message)),
  }
};
