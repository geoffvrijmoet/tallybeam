import connectToDatabase from '../lib/db';
import UserModel, { IUserModel } from '../models/User';
import { CognitoJwtPayload } from '../lib/cognito-verify';

export class UserService {
  static async findOrCreateFromCognito(cognitoUser: CognitoJwtPayload) {
    try {
      await connectToDatabase();
      
      let user = await (UserModel as IUserModel).findOne({ cognitoId: cognitoUser.sub });
      if (!user) {
        user = new UserModel({
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