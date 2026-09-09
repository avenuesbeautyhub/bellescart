import { IWallet } from '../../models/Wallet';

export interface IWalletInteractor {
  getWalletByUser(userId: string): Promise<IWallet | null>;
  createWalletForUser(userId: string): Promise<IWallet>;
  creditWallet(userId: string, amount: number, description: string, orderId?: string): Promise<IWallet>;
  debitWallet(userId: string, amount: number, description: string, orderId?: string): Promise<IWallet>;
  getWalletBalance(userId: string): Promise<number>;
}