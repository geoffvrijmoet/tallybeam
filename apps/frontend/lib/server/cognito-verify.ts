import { CognitoJwtPayload } from '../cognito';

export async function verifyCognitoToken(token: string): Promise<CognitoJwtPayload> {
  const jwksClient = require('jwks-client');
  const jwt = require('jsonwebtoken');

  const client = jwksClient({
    jwksUri: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}/.well-known/jwks.json`
  });

  function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, function(err: any, key: any) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}`,
      algorithms: ['RS256']
    }, (err: any, decoded: CognitoJwtPayload) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
} 