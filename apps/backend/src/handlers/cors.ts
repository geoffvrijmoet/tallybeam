import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const options = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('🔧 Handling OPTIONS request for CORS preflight');
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Credentials': 'false',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'CORS preflight successful' })
  };
}; 