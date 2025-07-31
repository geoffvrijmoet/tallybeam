import connectToDatabase from '../lib/db';
import UserModel, { IUserModel } from '../models/User';
import { CognitoJwtPayload } from '../lib/cognito-verify';

export class UserService {
  static async findOrCreateFromCognito(cognitoUser: CognitoJwtPayload) {
    try {
      await connectToDatabase();
      
      console.log('🔍 [UserService] Cognito user data:', JSON.stringify(cognitoUser, null, 2));
      console.log('🔍 [UserService] Available fields:', Object.keys(cognitoUser));
      console.log('🔍 [UserService] Email:', cognitoUser.email);
      console.log('🔍 [UserService] Given name:', cognitoUser.given_name);
      console.log('🔍 [UserService] Family name:', cognitoUser.family_name);
      console.log('🔍 [UserService] Name:', cognitoUser.name);
      console.log('🔍 [UserService] Picture:', cognitoUser.picture);
      
      let user = await (UserModel as IUserModel).findOne({ cognitoId: cognitoUser.sub });
      if (!user) {
        // Extract email from token
        const email = cognitoUser.email || '';
        if (!email) {
          throw new Error('Email is required but not found in token');
        }
        
        // Use email prefix as fallback for missing name
        const emailPrefix = email.split('@')[0];
        const firstName = cognitoUser.given_name || cognitoUser.name?.split(' ')[0] || emailPrefix;
        const lastName = cognitoUser.family_name || cognitoUser.name?.split(' ').slice(1).join(' ') || '';
        
        user = new UserModel({
          cognitoId: cognitoUser.sub,
          email: email,
          firstName: firstName,
          lastName: lastName,
          imageUrl: cognitoUser.picture || '',
          lastLoginAt: new Date()
        });
        await user.save();
        console.log('✅ Created new user for Cognito ID:', cognitoUser.sub);
      } else {
        // Update existing user, but don't overwrite existing name if token doesn't have it
        user.email = cognitoUser.email || user.email;
        if (cognitoUser.given_name || cognitoUser.name) {
          user.firstName = cognitoUser.given_name || cognitoUser.name?.split(' ')[0] || user.firstName;
          user.lastName = cognitoUser.family_name || cognitoUser.name?.split(' ').slice(1).join(' ') || user.lastName;
        }
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
  }

  static async findByCognitoId(cognitoId: string) {
    try {
      await connectToDatabase();
      return await (UserModel as IUserModel).findOne({ cognitoId });
    } catch (error) {
      console.error('❌ Error in findByCognitoId:', error);
      throw error;
    }
  }

  static async deactivateUser(cognitoId: string) {
    try {
      await connectToDatabase();
      const user = await (UserModel as IUserModel).findOne({ cognitoId });
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
  }
} 