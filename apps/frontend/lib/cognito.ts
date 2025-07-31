import { Amplify } from 'aws-amplify';

// Amplify v6 configuration format
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      // Temporarily disable OAuth to prevent code consumption
      // loginWith: {
      //   oauth: {
      //     domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
      //     scopes: ['email', 'openid', 'profile'],
      //     redirectSignIn: [process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback'],
      //     redirectSignOut: [process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT || 'http://localhost:3000/'],
      //     responseType: 'code' as const
      //   }
      // }
    }
  }
};

// Alternative configuration format that might work better
const alternativeConfig = {
  Auth: {
    Cognito: {
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      oauth: {
        domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
        scope: ['email', 'openid', 'profile'],
        redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback',
        redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT || 'http://localhost:3000/',
        responseType: 'code'
      }
    }
  }
};

// Legacy configuration format that's more commonly used
const legacyConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    oauth: {
      domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN || 'http://localhost:3000/auth/callback',
      redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT || 'http://localhost:3000/',
      responseType: 'code'
    }
  }
};

export function configureAmplify() {
  console.log('🔧 Environment variables check:', {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ? '✅ Set' : '❌ Missing',
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ? '✅ Set' : '❌ Missing',
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ? '✅ Set' : '❌ Missing',
    redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN ? '✅ Set' : '❌ Missing',
    redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT ? '✅ Set' : '❌ Missing'
  });
  
  console.log('🔧 Configuring Amplify v6 with:', {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    redirectSignIn: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNIN,
    redirectSignOut: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGNOUT
  });
  
  if (!process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || !process.env.NEXT_PUBLIC_COGNITO_DOMAIN) {
    console.error('❌ Missing required Cognito environment variables');
    throw new Error('Cognito configuration is incomplete. Please check your environment variables.');
  }
  
  console.log('🔧 Using Amplify v6 configuration format (OAuth disabled for manual handling)...');
  console.log('🔧 Configuration object:', JSON.stringify(cognitoConfig, null, 2));
  Amplify.configure(cognitoConfig);
  console.log('✅ Amplify v6 configuration applied successfully (OAuth disabled)');
}

// JWT verification utilities
export interface CognitoJwtPayload {
  sub: string; // User ID
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

// JWT verification is now in lib/server/cognito-verify.ts 