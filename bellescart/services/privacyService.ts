import { appConfig } from '@/config/appConfig';
import { apiFetch } from './apiInterceptor';

const API_BASE_URL = appConfig.apiBaseUrl;

export interface PrivacyPreferences {
  _id: string;
  userId: string;
  marketingEmails: boolean;
  consentVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivacyRequest {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: 'export';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  errorMessage?: string;
  exportDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataExport {
  profile: {
    name: string;
    email: string;
    phone: string | null;
    role: string;
    createdAt: string;
  };
  addresses: Array<{
    label: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
  }>;
  orders: Array<{
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  wishlist: Array<{
    productId: string;
    name: string | null;
    price: number | null;
    addedAt: string;
  }>;
  privacyPreferences: PrivacyPreferences | null;
  exportedAt: string;
}

class PrivacyService {
  async getPreferences(): Promise<{ success: boolean; data?: PrivacyPreferences; error?: string }> {
    try {
      const response = await apiFetch(`${API_BASE_URL}/privacy/preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting privacy preferences:', error);
      return {
        success: false,
        error: 'Failed to get privacy preferences'
      };
    }
  }

  async updatePreferences(data: { marketingEmails: boolean }): Promise<{ success: boolean; data?: PrivacyPreferences; error?: string }> {
    try {
      const response = await apiFetch(`${API_BASE_URL}/privacy/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating privacy preferences:', error);
      return {
        success: false,
        error: 'Failed to update privacy preferences'
      };
    }
  }

  async requestDataExport(): Promise<{ success: boolean; data?: PrivacyRequest; error?: string }> {
    try {
      const response = await apiFetch(`${API_BASE_URL}/privacy/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error requesting data export:', error);
      return {
        success: false,
        error: 'Failed to request data export'
      };
    }
  }

  async getUserRequests(): Promise<{ success: boolean; data?: PrivacyRequest[]; error?: string }> {
    try {
      const response = await apiFetch(`${API_BASE_URL}/privacy/requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting user privacy requests:', error);
      return {
        success: false,
        error: 'Failed to get privacy requests'
      };
    }
  }

  async downloadExport(requestId: string): Promise<{ success: boolean; data?: DataExport; error?: string }> {
    try {
      const response = await apiFetch(`${API_BASE_URL}/privacy/export/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error downloading export data:', error);
      return {
        success: false,
        error: 'Failed to download export data'
      };
    }
  }
}

export const privacyService = new PrivacyService();
