import mongoose, { Document, Schema } from 'mongoose';

export type PrivacyRequestType = 'export';
export type PrivacyRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IPrivacyRequest extends Document {
  userId: mongoose.Types.ObjectId;
  type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  requestedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  exportDataUrl?: string; // URL to download exported data (if using cloud storage)
  createdAt: Date;
  updatedAt: Date;
}

const privacyRequestSchema = new Schema<IPrivacyRequest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['export'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  completedAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    maxlength: [500, 'Error message cannot exceed 500 characters']
  },
  exportDataUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
privacyRequestSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
privacyRequestSchema.index({ userId: 1, createdAt: -1 });
privacyRequestSchema.index({ status: 1 });
privacyRequestSchema.index({ type: 1 });

export const PrivacyRequest = mongoose.model<IPrivacyRequest>('PrivacyRequest', privacyRequestSchema);
