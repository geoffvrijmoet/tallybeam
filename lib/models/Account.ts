import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  userId: string;
  name: string;
  accountNumber: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subcategory?: string;
  description?: string;
  balance: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  accountNumber: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] 
  },
  category: { type: String, required: true },
  subcategory: { type: String },
  description: { type: String },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Compound index for efficient queries
AccountSchema.index({ userId: 1, type: 1, category: 1 });
AccountSchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export const Account = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema); 