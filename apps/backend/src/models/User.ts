import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  cognitoId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  preferences?: Record<string, any>;
  isActive: boolean;
  lastLoginAt: Date;
  deactivatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends mongoose.Model<IUser> {
  findOrCreateFromCognito(cognitoUser: any): Promise<IUser>;
  findByCognitoId(cognitoId: string): Promise<IUser | null>;
  deactivateUser(cognitoId: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>({
  cognitoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  preferences: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  deactivatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Static method to find or create user from Cognito data
UserSchema.statics.findOrCreateFromCognito = async function(cognitoUser: any) {
  try {
    let user = await this.findOne({ cognitoId: cognitoUser.sub });
    if (!user) {
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

// Static method to find user by Cognito ID
UserSchema.statics.findByCognitoId = async function(cognitoId: string) {
  try {
    return await this.findOne({ cognitoId });
  } catch (error) {
    console.error('❌ Error in findByCognitoId:', error);
    throw error;
  }
};

// Static method to deactivate user
UserSchema.statics.deactivateUser = async function(cognitoId: string) {
  try {
    const user = await this.findOne({ cognitoId });
    if (user) {
      user.isActive = false;
      user.deactivatedAt = new Date();
      await user.save();
      console.log('✅ Deactivated user for Cognito ID:', cognitoId);
      return user;
    }
    return null;
  } catch (error) {
    console.error('❌ Error in deactivateUser:', error);
    throw error;
  }
};

export default mongoose.model<IUser, IUserModel>('User', UserSchema); 