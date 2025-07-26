import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    const connection = await connectToDatabase();
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Connection state: ${connection.readyState}`);
    console.log(`🏷️  Database name: ${connection.name}`);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      details: {
        readyState: connection.readyState,
        databaseName: connection.name,
        host: connection.host,
        port: connection.port
      }
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 