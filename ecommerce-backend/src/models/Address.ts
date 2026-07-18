import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  label: {
    type: String,
    required: [true, 'Please provide an address label']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  city: {
    type: String,
    required: [true, 'Please provide a city']
  },
  state: {
    type: String,
    required: [true, 'Please provide a state']
  },
  zipCode: {
    type: String,
    required: [true, 'Please provide a zip code']
  },
  country: {
    type: String,
    required: [true, 'Please provide a country'],
    default: 'India'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries on userId
addressSchema.index({ userId: 1, isDefault: -1 });

export const Address = mongoose.model<IAddress>('Address', addressSchema);
