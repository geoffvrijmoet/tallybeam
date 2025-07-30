import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-client';

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
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000, // 10 minutes
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
    jwt.verify(token, getKey, {
      audience: process.env.COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      algorithms: ['RS256']
    }, (err: any, decoded: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as CognitoJwtPayload);
      }
    });
  });
} 