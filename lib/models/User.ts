import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  clerkId: string; // Clerk user ID
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  preferences?: {
    defaultCurrency: string;
    defaultPaymentMethod: string;
    emailNotifications: boolean;
  };
}

// Interface for User model static methods
export interface IUserModel extends Model<IUser> {
  findOrCreateFromClerk(clerkUser: any): Promise<IUser>;
  findByClerkId(clerkId: string): Promise<IUser | null>;
  deactivateUser(clerkId: string): Promise<IUser | null>;
}

// Mongoose schema
const UserSchema: Schema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      index: true
    },
    firstName: {
      type: String,
      sparse: true
    },
    lastName: {
      type: String,
      sparse: true
    },
    imageUrl: {
      type: String
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    preferences: {
      defaultCurrency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD']
      },
      defaultPaymentMethod: {
        type: String,
        default: 'venmo',
        enum: ['cash', 'check', 'bank_transfer', 'venmo', 'paypal', 'other']
      },
      emailNotifications: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true // This adds createdAt and updatedAt automatically
  }
);

// Create indexes for common queries
UserSchema.index({ email: 1 });
UserSchema.index({ clerkId: 1 });
UserSchema.index({ isActive: 1 });

// Static method to find or create user from Clerk data
UserSchema.statics.findOrCreateFromClerk = async function(clerkUser: any) {
  try {
    // Try to find existing user
    let user = await this.findOne({ clerkId: clerkUser.clerkId });
    
    if (!user) {
      // Create new user if not found
      user = new this({
        clerkId: clerkUser.clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl || '',
        lastLoginAt: new Date()
      });
      
      await user.save();
      console.log('✅ Created new user for Clerk ID:', clerkUser.clerkId);
    } else {
      // Update existing user's info
      user.email = clerkUser.emailAddresses[0]?.emailAddress || user.email;
      user.firstName = clerkUser.firstName || user.firstName;
      user.lastName = clerkUser.lastName || user.lastName;
      user.imageUrl = clerkUser.imageUrl || user.imageUrl;
      user.lastLoginAt = new Date();
      
      await user.save();
      console.log('✅ Updated existing user for Clerk ID:', clerkUser.clerkId);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error in findOrCreateFromClerk:', error);
    throw error;
  }
};

// Static method to get user by Clerk ID
UserSchema.statics.findByClerkId = async function(clerkId: string) {
  return await this.findOne({ clerkId, isActive: true });
};

// Static method to deactivate user
UserSchema.statics.deactivateUser = async function(clerkId: string) {
  return await this.findOneAndUpdate(
    { clerkId },
    { isActive: false },
    { new: true }
  );
};

// Export the model
export default mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema); 