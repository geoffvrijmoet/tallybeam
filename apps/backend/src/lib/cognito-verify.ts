import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-client';

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

export async function verifyCognitoToken(token: string): Promise<CognitoJwtPayload> {
  const jwksUri = `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
  
  const client = jwksClient({
    jwksUri
  });

  function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, function(err: any, key: any) {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  return new Promise((resolve, reject) => {
    // First, let's decode the token without verification to see what audience it has
    const decodedToken = jwt.decode(token) as any;
    console.log('🔍 Decoded token audience:', decodedToken?.aud);
    console.log('🔍 Expected audience:', process.env.COGNITO_CLIENT_ID);
    
    jwt.verify(token, getKey, {
      audience: process.env.COGNITO_CLIENT_ID, // Use environment variable
      issuer: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      algorithms: ['RS256']
    }, (err: any, decoded: any) => {
      if (err) {
        console.log('🔍 JWT verification error:', err.message);
        reject(err);
      } else {
        resolve(decoded as CognitoJwtPayload);
      }
    });
  });
} 