import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showActivity: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema<IUserPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'ml','hi']
  },
  theme: {
    type: String,
    default: 'auto',
    enum: ['light', 'dark', 'auto']
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      default: 'private',
      enum: ['public', 'private']
    },
    showActivity: {
      type: Boolean,
      default: false
    }
  },
  accessibility: {
    fontSize: {
      type: String,
      default: 'medium',
      enum: ['small', 'medium', 'large']
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    reducedMotion: {
      type: Boolean,
      default: false
    }
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
userPreferencesSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', userPreferencesSchema);