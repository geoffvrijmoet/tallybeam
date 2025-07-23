import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserService } from '../../../../lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - User not authenticated' 
        },
        { status: 401 }
      );
    }

    // Get current user from Clerk to verify they exist
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Clerk user not found' 
        },
        { status: 401 }
      );
    }

    // Verify the user ID matches
    if (clerkUser.id !== userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - User ID mismatch' 
        },
        { status: 403 }
      );
    }

    // Sync the current user with MongoDB
    const user = await UserService.getCurrentUser();
    
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        preferences: user.preferences,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - User not authenticated' 
        },
        { status: 401 }
      );
    }

    // Get current user from Clerk to verify they exist
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Clerk user not found' 
        },
        { status: 401 }
      );
    }

    // Verify the user ID matches
    if (clerkUser.id !== userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - User ID mismatch' 
        },
        { status: 403 }
      );
    }

    // Get the current user
    const user = await UserService.getCurrentUser();
    
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        preferences: user.preferences,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 