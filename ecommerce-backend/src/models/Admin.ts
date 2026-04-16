import { IAdmin } from './User';
import mongoose, { Document, Schema } from 'mongoose';

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
        minlength: [6, 'Password must be at least 6 characters long']
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

// Add comparePassword method to adminSchema
adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return this.password === candidatePassword; // Simplified - in production, use bcrypt
};

// Create Admin model
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
