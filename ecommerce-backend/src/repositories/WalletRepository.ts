import { Wallet, IWallet } from '../models/Wallet';
import { BaseRepository } from './BaseRepository';

export class WalletRepository extends BaseRepository<IWallet> {
  constructor() {
    super(Wallet);
  }

  async findByUser(userId: string): Promise<IWallet | null> {
    return this.findOne({ user: userId });
  }

  async createWalletForUser(userId: string): Promise<IWallet> {
    const existingWallet = await this.findByUser(userId);
    if (existingWallet) {
      return existingWallet;
    }
    return this.create({ user: userId, balance: 0 });
  }

  async addTransaction(userId: string, transaction: {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    orderId?: string;
  }): Promise<IWallet | null> {
    const wallet = await this.findByUser(userId);
    if (!wallet) {
      throw new Error('Wallet not found for user');
    }

    const newBalance = transaction.type === 'credit' 
      ? wallet.balance + transaction.amount 
      : wallet.balance - transaction.amount;

    if (newBalance < 0) {
      throw new Error('Insufficient wallet balance');
    }

    const newTransaction = {
      ...transaction,
      balance: newBalance,
      createdAt: new Date()
    };

    return this.update(wallet._id.toString(), {
      balance: newBalance,
      $push: { transactions: newTransaction }
    });
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.findByUser(userId);
    return wallet?.balance || 0;
  }
}