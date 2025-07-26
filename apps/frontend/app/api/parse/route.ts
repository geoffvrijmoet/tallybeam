import { NextRequest, NextResponse } from 'next/server';
import { parseInvoiceDetails } from '../../../lib/services/ai';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      console.log('❌ Invalid input received:', typeof input);
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI Parsing request received:', input.substring(0, 50) + '...');
    
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('❌ GEMINI_API_KEY environment variable not found');
      return NextResponse.json(
        { error: 'AI service not configured. Please check server environment variables.' },
        { status: 500 }
      );
    }
    
    console.log('✅ API key found, proceeding with AI parsing...');

    const parsedData = await parseInvoiceDetails(input);

    if (parsedData) {
      console.log('✅ AI Parsing successful:', {
        clientName: parsedData.clientName,
        amount: parsedData.amount,
        confidence: parsedData.confidence
      });
    } else {
      console.log('❌ AI Parsing failed - no valid data extracted');
    }

    return NextResponse.json({ parsedData });

  } catch (error) {
    console.error('🚨 AI Parsing error:', error);
    return NextResponse.json(
      { error: 'AI parsing failed' },
      { status: 500 }
    );
  }
} 