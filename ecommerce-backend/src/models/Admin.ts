import { IAdmin } from './User';
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Create Admin schema (separate from User schema)
const adminSchema = new Schema<IAdmin>({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin']
    },
    phone: {
        type: String,
        trim: true
    },
    permissions: [{
        type: String,
        enum: ['users', 'products', 'orders', 'analytics', 'settings']
    }],
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add comparePassword method to adminSchema
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create Admin model with proper typing
type AdminModel = Model<IAdmin>;

export const Admin = (mongoose.models.Admin as AdminModel) || mongoose.model<IAdmin>('Admin', adminSchema) as AdminModel;
