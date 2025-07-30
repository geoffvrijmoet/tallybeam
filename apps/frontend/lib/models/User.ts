import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  cognitoId: string; // Cognito user ID (sub)
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
  findOrCreateFromCognito(cognitoUser: any): Promise<IUser>;
  findByCognitoId(cognitoId: string): Promise<IUser | null>;
  deactivateUser(cognitoId: string): Promise<IUser | null>;
}

// Mongoose schema
const UserSchema: Schema = new Schema(
  {
    cognitoId: {
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
UserSchema.index({ cognitoId: 1 });
UserSchema.index({ isActive: 1 });

// Static method to find or create user from Cognito data
UserSchema.statics.findOrCreateFromCognito = async function(cognitoUser: any) {
  try {
    // Try to find existing user
    let user = await this.findOne({ cognitoId: cognitoUser.sub });
    
    if (!user) {
      // Create new user if not found
      user = new this({
        cognitoId: cognitoUser.sub,
        email: cognitoUser.email || '',
        firstName: cognitoUser.given_name || cognitoUser.name?.split(' ')[0] || '',
        lastName: cognitoUser.family_name || cognitoUser.name?.split(' ').slice(1).join(' ') || '',
        imageUrl: cognitoUser.picture || '',
        lastLoginAt: new Date()
      });
      
      await user.save();
      console.log('✅ Created new user for Cognito ID:', cognitoUser.sub);
    } else {
      // Update existing user's info
      user.email = cognitoUser.email || user.email;
      user.firstName = cognitoUser.given_name || cognitoUser.name?.split(' ')[0] || user.firstName;
      user.lastName = cognitoUser.family_name || cognitoUser.name?.split(' ').slice(1).join(' ') || user.lastName;
      user.imageUrl = cognitoUser.picture || user.imageUrl;
      user.lastLoginAt = new Date();
      
      await user.save();
      console.log('✅ Updated existing user for Cognito ID:', cognitoUser.sub);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error in findOrCreateFromCognito:', error);
    throw error;
  }
};

// Static method to get user by Cognito ID
UserSchema.statics.findByCognitoId = async function(cognitoId: string) {
  return await this.findOne({ cognitoId, isActive: true });
};

// Static method to deactivate user
UserSchema.statics.deactivateUser = async function(cognitoId: string) {
  return await this.findOneAndUpdate(
    { cognitoId },
    { isActive: false },
    { new: true }
  );
};

// Export the model
export default mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema); 