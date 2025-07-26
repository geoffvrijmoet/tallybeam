import { Account, IAccount } from '../models/Account';
import { Transaction, ITransaction } from '../models/Transaction';
import connectToDatabase from '../db';

export interface DefaultAccount {
  name: string;
  accountNumber: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subcategory?: string;
  description?: string;
  isDefault?: boolean;
}

const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccount[] = [
  // Assets
  { name: 'Checking Account', accountNumber: '1000', type: 'asset', category: 'Current Assets', subcategory: 'Cash and Cash Equivalents', description: 'Primary business checking account' },
  { name: 'Savings Account', accountNumber: '1001', type: 'asset', category: 'Current Assets', subcategory: 'Cash and Cash Equivalents', description: 'Business savings account' },
  { name: 'Accounts Receivable', accountNumber: '1100', type: 'asset', category: 'Current Assets', subcategory: 'Accounts Receivable', description: 'Money owed by customers' },
  { name: 'Inventory', accountNumber: '1200', type: 'asset', category: 'Current Assets', subcategory: 'Inventory', description: 'Products held for sale' },
  { name: 'Prepaid Expenses', accountNumber: '1300', type: 'asset', category: 'Current Assets', subcategory: 'Prepaid Expenses', description: 'Expenses paid in advance' },
  { name: 'Equipment', accountNumber: '1500', type: 'asset', category: 'Fixed Assets', subcategory: 'Equipment', description: 'Business equipment and machinery' },
  { name: 'Accumulated Depreciation', accountNumber: '1501', type: 'asset', category: 'Fixed Assets', subcategory: 'Accumulated Depreciation', description: 'Accumulated depreciation on equipment' },
  
  // Liabilities
  { name: 'Accounts Payable', accountNumber: '2000', type: 'liability', category: 'Current Liabilities', subcategory: 'Accounts Payable', description: 'Money owed to vendors' },
  { name: 'Credit Card', accountNumber: '2100', type: 'liability', category: 'Current Liabilities', subcategory: 'Credit Cards', description: 'Business credit card' },
  { name: 'Sales Tax Payable', accountNumber: '2200', type: 'liability', category: 'Current Liabilities', subcategory: 'Taxes', description: 'Sales tax collected but not yet remitted' },
  { name: 'Payroll Liabilities', accountNumber: '2300', type: 'liability', category: 'Current Liabilities', subcategory: 'Payroll', description: 'Payroll taxes and withholdings' },
  
  // Equity
  { name: 'Owner\'s Equity', accountNumber: '3000', type: 'equity', category: 'Equity', subcategory: 'Owner\'s Equity', description: 'Owner\'s investment in the business' },
  { name: 'Retained Earnings', accountNumber: '3100', type: 'equity', category: 'Equity', subcategory: 'Retained Earnings', description: 'Accumulated profits/losses' },
  
  // Revenue
  { name: 'Sales Revenue', accountNumber: '4000', type: 'revenue', category: 'Revenue', subcategory: 'Sales', description: 'Revenue from sales of goods/services' },
  { name: 'Service Revenue', accountNumber: '4100', type: 'revenue', category: 'Revenue', subcategory: 'Services', description: 'Revenue from services provided' },
  { name: 'Interest Income', accountNumber: '4200', type: 'revenue', category: 'Revenue', subcategory: 'Other Income', description: 'Interest earned on investments' },
  
  // Expenses
  { name: 'Cost of Goods Sold', accountNumber: '5000', type: 'expense', category: 'Cost of Goods Sold', subcategory: 'Materials', description: 'Direct costs of producing goods' },
  { name: 'Advertising', accountNumber: '6000', type: 'expense', category: 'Operating Expenses', subcategory: 'Marketing', description: 'Advertising and marketing expenses' },
  { name: 'Office Supplies', accountNumber: '6100', type: 'expense', category: 'Operating Expenses', subcategory: 'Supplies', description: 'Office supplies and materials' },
  { name: 'Rent Expense', accountNumber: '6200', type: 'expense', category: 'Operating Expenses', subcategory: 'Rent', description: 'Office and equipment rent' },
  { name: 'Utilities', accountNumber: '6300', type: 'expense', category: 'Operating Expenses', subcategory: 'Utilities', description: 'Electricity, water, internet, etc.' },
  { name: 'Insurance', accountNumber: '6400', type: 'expense', category: 'Operating Expenses', subcategory: 'Insurance', description: 'Business insurance premiums' },
  { name: 'Professional Services', accountNumber: '6500', type: 'expense', category: 'Operating Expenses', subcategory: 'Professional Services', description: 'Legal, accounting, consulting fees' },
  { name: 'Travel & Meals', accountNumber: '6600', type: 'expense', category: 'Operating Expenses', subcategory: 'Travel', description: 'Business travel and meal expenses' },
  { name: 'Depreciation Expense', accountNumber: '6700', type: 'expense', category: 'Operating Expenses', subcategory: 'Depreciation', description: 'Depreciation of fixed assets' },
];

export class AccountingService {
  static async setupDefaultChartOfAccounts(userId: string): Promise<IAccount[]> {
    await connectToDatabase();
    
    // Check if user already has accounts
    const existingAccounts = await Account.find({ userId });
    if (existingAccounts.length > 0) {
      return existingAccounts;
    }
    
    // Create default accounts
    const accounts = await Promise.all(
      DEFAULT_CHART_OF_ACCOUNTS.map(async (defaultAccount) => {
        const account = new Account({
          userId,
          ...defaultAccount,
          balance: 0,
          isActive: true,
          isDefault: defaultAccount.isDefault || false
        });
        return await account.save();
      })
    );
    
    return accounts;
  }
  
  static async getAccounts(userId: string, type?: string): Promise<IAccount[]> {
    await connectToDatabase();
    
    const filter: any = { userId, isActive: true };
    if (type) {
      filter.type = type;
    }
    
    return await Account.find(filter).sort({ accountNumber: 1 });
  }
  
  static async createTransaction(userId: string, transactionData: Partial<ITransaction>): Promise<ITransaction> {
    await connectToDatabase();
    
    // Generate transaction number
    const lastTransaction = await Transaction.findOne({ userId }).sort({ transactionNumber: -1 });
    const nextNumber = lastTransaction ? 
      parseInt(lastTransaction.transactionNumber) + 1 : 1;
    const transactionNumber = nextNumber.toString().padStart(6, '0');
    
    const transaction = new Transaction({
      userId,
      transactionNumber,
      ...transactionData,
      status: 'posted'
    });
    
    return await transaction.save();
  }
  
  static async getTransactions(userId: string, limit = 50, offset = 0): Promise<ITransaction[]> {
    await connectToDatabase();
    
    return await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('relatedInvoiceId');
  }
  
  static async getAccountBalance(userId: string, accountId: string): Promise<number> {
    await connectToDatabase();
    
    const account = await Account.findOne({ userId, _id: accountId });
    if (!account) {
      throw new Error('Account not found');
    }
    
    return account.balance;
  }
  
  static async updateAccountBalances(userId: string): Promise<void> {
    await connectToDatabase();
    
    const accounts = await Account.find({ userId });
    
    for (const account of accounts) {
      const transactions = await Transaction.find({
        userId,
        'lines.accountId': account._id,
        status: 'posted'
      });
      
      let balance = 0;
      for (const transaction of transactions) {
        for (const line of transaction.lines) {
          if (line.accountId.toString() === account._id.toString()) {
            if (account.type === 'asset' || account.type === 'expense') {
              balance += line.debit - line.credit;
            } else {
              balance += line.credit - line.debit;
            }
          }
        }
      }
      
      account.balance = balance;
      await account.save();
    }
  }
} 