import { IWallet } from '../../models/Wallet';
import { IBaseRepository } from './IBaseRepository';

export interface IWalletRepository extends IBaseRepository<IWallet> {
  findByUser(userId: string): Promise<IWallet | null>;
  createWalletForUser(userId: string): Promise<IWallet>;
  addTransaction(userId: string, transaction: {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    orderId?: string;
  }): Promise<IWallet | null>;
  getWalletBalance(userId: string): Promise<number>;
}