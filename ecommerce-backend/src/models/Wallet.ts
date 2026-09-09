import mongoose, { Document, Schema } from 'mongoose';

export interface IWalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  balance: number;
  createdAt: Date;
}

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: IWalletTransaction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  balance: {
    type: Number,
    required: true,
    min: [0, 'Balance cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new Schema<IWallet>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  transactions: [walletTransactionSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
walletSchema.index({ user: 1 });
walletSchema.index({ balance: 1 });

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);