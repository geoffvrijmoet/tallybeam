import connectToDatabase from '../db';
import UserModel, { IUserModel } from '../models/User';
import { verifyCognitoToken } from '../server/cognito-verify';
import { CognitoJwtPayload } from '../cognito';

export class UserService {
  /**
   * Get or create a user document for the current authenticated user
   */
  static async getCurrentUser(authToken?: string) {
    try {
      if (!authToken) {
        throw new Error('Authentication token required');
      }

      await connectToDatabase();
      
      // Verify the Cognito JWT token
      const cognitoUser = await verifyCognitoToken(authToken);
      
      if (!cognitoUser) {
        throw new Error('Invalid authentication token');
      }

      // Use the static method to find or create user
      const user = await (UserModel as IUserModel).findOrCreateFromCognito(cognitoUser);

      return user;
    } catch (error) {
      console.error('❌ Error in getCurrentUser:', error);
      throw error;
    }
  }

  /**
   * Get user by Cognito ID
   */
  static async getUserByCognitoId(cognitoId: string) {
    try {
      await connectToDatabase();
      return await (UserModel as IUserModel).findByCognitoId(cognitoId);
    } catch (error) {
      console.error('❌ Error in getUserByCognitoId:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(clerkId: string, preferences: any) {
    try {
      await connectToDatabase();
      
      const user = await UserModel.findOneAndUpdate(
        { clerkId },
        { 
          $set: { 
            preferences: { ...preferences },
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      return user;
    } catch (error) {
      console.error('❌ Error in updateUserPreferences:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(clerkId: string) {
    try {
      await connectToDatabase();
      return await (UserModel as IUserModel).deactivateUser(clerkId);
    } catch (error) {
      console.error('❌ Error in deactivateUser:', error);
      throw error;
    }
  }

  /**
   * Get all active users (admin function)
   */
  static async getAllActiveUsers() {
    try {
      await connectToDatabase();
      return await UserModel.find({ isActive: true }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Error in getAllActiveUsers:', error);
      throw error;
    }
  }
} 