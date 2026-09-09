import { IWalletInteractor } from '../providers/interfaces/IWalletInteractor';
import { IWalletRepository } from '../providers/interfaces/IWalletRepository';
import { IWallet } from '../models/Wallet';

export class WalletInteractor implements IWalletInteractor {
  private _walletRepository: IWalletRepository;

  constructor(walletRepository: IWalletRepository) {
    this._walletRepository = walletRepository;
  }

  async getWalletByUser(userId: string): Promise<IWallet | null> {
    return this._walletRepository.findByUser(userId);
  }

  async createWalletForUser(userId: string): Promise<IWallet> {
    return this._walletRepository.createWalletForUser(userId);
  }

  async creditWallet(userId: string, amount: number, description: string, orderId?: string): Promise<IWallet> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    const wallet = await this._walletRepository.findByUser(userId);
    if (!wallet) {
      const newWallet = await this._walletRepository.createWalletForUser(userId);
      return this._walletRepository.addTransaction(userId, {
        type: 'credit',
        amount,
        description,
        orderId
      }) as Promise<IWallet>;
    }

    return this._walletRepository.addTransaction(userId, {
      type: 'credit',
      amount,
      description,
      orderId
    }) as Promise<IWallet>;
  }

  async debitWallet(userId: string, amount: number, description: string, orderId?: string): Promise<IWallet> {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    const wallet = await this._walletRepository.findByUser(userId);
    if (!wallet) {
      throw new Error('Wallet not found for user');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    return this._walletRepository.addTransaction(userId, {
      type: 'debit',
      amount,
      description,
      orderId
    }) as Promise<IWallet>;
  }

  async getWalletBalance(userId: string): Promise<number> {
    return this._walletRepository.getWalletBalance(userId);
  }
}