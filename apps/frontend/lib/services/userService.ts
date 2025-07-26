import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '../db';
import UserModel, { IUserModel } from '../models/User';

export class UserService {
  /**
   * Get or create a user document for the current authenticated user
   */
  static async getCurrentUser() {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await connectToDatabase();
      
      // Get user from Clerk
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        throw new Error('Clerk user not found');
      }

      // Use the static method to find or create user
      const user = await (UserModel as IUserModel).findOrCreateFromClerk({
        clerkId: clerkUser.id,
        emailAddresses: clerkUser.emailAddresses || [],
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl || ''
      });

      return user;
    } catch (error) {
      console.error('❌ Error in getCurrentUser:', error);
      throw error;
    }
  }

  /**
   * Get user by Clerk ID
   */
  static async getUserByClerkId(clerkId: string) {
    try {
      await connectToDatabase();
      return await (UserModel as IUserModel).findByClerkId(clerkId);
    } catch (error) {
      console.error('❌ Error in getUserByClerkId:', error);
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