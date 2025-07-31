import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { verifyCognitoToken } from '../lib/cognito-verify';
import { UserService } from '../services/userService';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// OPTIONS handler for CORS preflight
export const options = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔧 Handling OPTIONS request for CORS preflight');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'CORS preflight successful' })
  };
};


export const sync = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔍 [syncUser] Request received');
  console.log('🔍 [syncUser] Headers:', JSON.stringify(event.headers, null, 2));
  console.log('🔍 [syncUser] Method:', event.httpMethod);
  console.log('🔍 [syncUser] Path:', event.path);
  
  try {
    // Get the authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    console.log('🔍 [syncUser] Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 [syncUser] Token length:', token ? token.length : 0);
    console.log('🔍 [syncUser] Token preview:', token ? `${token.substring(0, 20)}...` : 'None');

    if (!token) {
      console.log('❌ [syncUser] No token provided');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized - No token provided'
        })
      };
    }

    // Verify the Cognito token and get user info
    console.log('🔍 [syncUser] Attempting to verify token...');
    const cognitoUser = await verifyCognitoToken(token);
    console.log('🔍 [syncUser] Token verification result:', cognitoUser ? 'Success' : 'Failed');
    
    if (!cognitoUser) {
      console.log('❌ [syncUser] Token verification failed');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized - Invalid token'
        })
      };
    }

    // Sync the user with MongoDB
    const user = await UserService.findOrCreateFromCognito(cognitoUser);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        success: true,
        user: {
          _id: user._id,
          cognitoId: user.cognitoId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      })
    };
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to sync user',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized - No token provided'
        })
      };
    }

    // Verify the Cognito token and get user info
    const cognitoUser = await verifyCognitoToken(token);
    if (!cognitoUser) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized - Invalid token'
        })
      };
    }

    // Get the user from MongoDB
    const user = await UserService.findByCognitoId(cognitoUser.sub);
    
    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          success: false,
          error: 'User not found'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        success: true,
        user: {
          _id: user._id,
          cognitoId: user.cognitoId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      })
    };
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get user',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 