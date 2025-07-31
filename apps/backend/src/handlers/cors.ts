import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const options = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔧 Handling OPTIONS request for CORS preflight');
  console.log('🔧 Path:', event.path);
  console.log('🔧 Method:', event.httpMethod);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'CORS preflight successful' })
  };
}; 