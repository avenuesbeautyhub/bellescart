import mongoose, { Document, Schema } from 'mongoose';

export interface IPrivacyPreference extends Document {
  userId: mongoose.Types.ObjectId;
  marketingEmails: boolean;
  consentVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const privacyPreferenceSchema = new Schema<IPrivacyPreference>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  marketingEmails: {
    type: Boolean,
    default: false // Conservative default - opt-in required
  },
  consentVersion: {
    type: String,
    default: '2026-09-15' // Version identifier for consent tracking
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
privacyPreferenceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const PrivacyPreference = mongoose.model<IPrivacyPreference>('PrivacyPreference', privacyPreferenceSchema);
