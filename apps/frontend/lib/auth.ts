import { NextRequest, NextResponse } from 'next/server';
import { verifyCognitoToken } from './server/cognito-verify';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    sub: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = await verifyCognitoToken(token);
    
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = decoded;
    
    return authenticatedRequest;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authenticatedRequest = await authenticateRequest(request);
    
    if (!authenticatedRequest) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    return handler(authenticatedRequest);
  };
} 