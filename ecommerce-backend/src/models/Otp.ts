import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: number;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  userData?: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };
}

const OtpSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 1 * 60 * 1000) // 1 minute from now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  userData: {
    name: String,
    email: String,
    password: String,
    phone: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
OtpSchema.index({ email: 1, expiresAt: 1 });

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
