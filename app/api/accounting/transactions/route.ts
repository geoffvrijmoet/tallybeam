import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountingService } from '../../../../lib/services/accountingService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const transactions = await AccountingService.getTransactions(userId, limit, offset);
    
    return NextResponse.json({
      success: true,
      transactions: transactions.map((transaction: any) => ({
        _id: transaction._id,
        transactionNumber: transaction.transactionNumber,
        date: transaction.date,
        description: transaction.description,
        type: transaction.type,
        status: transaction.status,
        totalDebit: transaction.totalDebit,
        totalCredit: transaction.totalCredit,
        isBalanced: transaction.isBalanced,
        lines: transaction.lines
      }))
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 