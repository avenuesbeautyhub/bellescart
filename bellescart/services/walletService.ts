import { apiGet, apiPost } from './apiInterceptor';

export interface WalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  balance: number;
  createdAt: string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  transactions: WalletTransaction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  success: boolean;
  data?: {
    wallet: Wallet;
  };
  message?: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  data?: {
    balance: number;
  };
  message?: string;
}

export const walletService = {
  // Get user wallet
  getWallet: async (): Promise<WalletResponse> => {
    try {
      const response = await apiGet('/wallet');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  },

  // Get wallet balance
  getBalance: async (): Promise<WalletBalanceResponse> => {
    try {
      const response = await apiGet('/wallet/balance');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  // Credit wallet
  creditWallet: async (request: {
    amount: number;
    description: string;
    orderId?: string;
  }): Promise<WalletResponse> => {
    try {
      const response = await apiPost('/wallet/credit', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error crediting wallet:', error);
      throw error;
    }
  },

  // Debit wallet
  debitWallet: async (request: {
    amount: number;
    description: string;
    orderId?: string;
  }): Promise<WalletResponse> => {
    try {
      const response = await apiPost('/wallet/debit', request);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error debiting wallet:', error);
      throw error;
    }
  },
};