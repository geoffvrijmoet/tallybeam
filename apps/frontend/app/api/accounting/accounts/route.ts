import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountingService } from '../../../../lib/services/accountingService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const accounts = await AccountingService.getAccounts(userId);
    
    return NextResponse.json({
      success: true,
      accounts: accounts.map((account: any) => ({
        _id: account._id,
        name: account.name,
        accountNumber: account.accountNumber,
        type: account.type,
        category: account.category,
        subcategory: account.subcategory,
        balance: account.balance,
        isActive: account.isActive
      }))
    });
    
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
} 