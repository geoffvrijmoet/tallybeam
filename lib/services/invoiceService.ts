import connectToDatabase from '../db';
import { Transaction } from '../models/Transaction';
import { AccountingService } from './accountingService';
import { CreateInvoiceRequest } from '../models/Transaction';

export class InvoiceService {
  static async createInvoice(invoiceData: CreateInvoiceRequest, userId?: string) {
    await connectToDatabase();
    
    // Generate invoice number
    const invoiceNumber = (Transaction as any).generateInvoiceNumber();
    
    // Create the transaction document with invoice type
    const transaction = new Transaction({
      userId: userId || 'anonymous',
      transactionNumber: invoiceNumber,
      date: invoiceData.issueDate ? new Date(invoiceData.issueDate) : new Date(),
      description: invoiceData.description,
      type: 'invoice',
      status: 'posted',
      lines: [], // Will be populated by createInvoiceTransaction if user is authenticated
      totalDebit: invoiceData.amount,
      totalCredit: invoiceData.amount,
      isBalanced: true,
      
      // Invoice-specific fields
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      currency: invoiceData.currency || 'USD',
      dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: invoiceData.issueDate ? new Date(invoiceData.issueDate) : new Date(),
      notes: invoiceData.notes,
      invoiceStatus: 'draft',
      paymentMethod: invoiceData.paymentMethod || 'venmo',
      venmoUsername: invoiceData.venmoUsername
    });
    
    const savedTransaction = await transaction.save();
    
    // If user is authenticated, create corresponding accounting transaction
    if (userId) {
      await this.createInvoiceTransaction(savedTransaction, userId);
    }
    
    return savedTransaction;
  }
  
  static async createInvoiceTransaction(transaction: any, userId: string) {
    // Get or create necessary accounts
    const accounts = await AccountingService.getAccounts(userId);
    
    // Find or create Accounts Receivable account
    let accountsReceivable = accounts.find((acc: any) => 
      acc.name === 'Accounts Receivable' && acc.type === 'asset'
    );
    
    if (!accountsReceivable) {
      // Create default accounts if they don't exist
      await AccountingService.setupDefaultChartOfAccounts(userId);
      const updatedAccounts = await AccountingService.getAccounts(userId);
      accountsReceivable = updatedAccounts.find((acc: any) => 
        acc.name === 'Accounts Receivable' && acc.type === 'asset'
      );
    }
    
    // Find or create Sales Revenue account
    let salesRevenue = accounts.find((acc: any) => 
      acc.name === 'Sales Revenue' && acc.type === 'revenue'
    );
    
    if (!salesRevenue) {
      const updatedAccounts = await AccountingService.getAccounts(userId);
      salesRevenue = updatedAccounts.find((acc: any) => 
        acc.name === 'Sales Revenue' && acc.type === 'revenue'
      );
    }
    
    if (!accountsReceivable || !salesRevenue) {
      throw new Error('Required accounts not found');
    }
    
    // Update the transaction with accounting lines
    transaction.lines = [
      {
        accountId: accountsReceivable._id,
        accountName: accountsReceivable.name,
        accountNumber: accountsReceivable.accountNumber,
        debit: transaction.totalDebit,
        credit: 0,
        description: `Invoice #${transaction.transactionNumber}`
      },
      {
        accountId: salesRevenue._id,
        accountName: salesRevenue.name,
        accountNumber: salesRevenue.accountNumber,
        debit: 0,
        credit: transaction.totalCredit,
        description: `Revenue from ${transaction.clientName}`
      }
    ];
    
    await transaction.save();
    
    // Update account balances
    await AccountingService.updateAccountBalances(userId);
  }
  
  static async recordPayment(transactionId: string, amount: number, userId: string) {
    await connectToDatabase();
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.type !== 'invoice') {
      throw new Error('Invoice transaction not found');
    }
    
    // Update invoice status
    transaction.invoiceStatus = 'paid';
    await transaction.save();
    
    // Get accounts
    const accounts = await AccountingService.getAccounts(userId);
    
    // Find checking account (primary cash account)
    let checkingAccount = accounts.find((acc: any) => 
      acc.name === 'Checking Account' && acc.type === 'asset'
    );
    
    if (!checkingAccount) {
      // Create default accounts if needed
      await AccountingService.setupDefaultChartOfAccounts(userId);
      const updatedAccounts = await AccountingService.getAccounts(userId);
      checkingAccount = updatedAccounts.find((acc: any) => 
        acc.name === 'Checking Account' && acc.type === 'asset'
      );
    }
    
    // Find Accounts Receivable
    let accountsReceivable = accounts.find((acc: any) => 
      acc.name === 'Accounts Receivable' && acc.type === 'asset'
    );
    
    if (!accountsReceivable) {
      const updatedAccounts = await AccountingService.getAccounts(userId);
      accountsReceivable = updatedAccounts.find((acc: any) => 
        acc.name === 'Accounts Receivable' && acc.type === 'asset'
      );
    }
    
    if (!checkingAccount || !accountsReceivable) {
      throw new Error('Required accounts not found');
    }
    
    // Create payment transaction
    const paymentTransactionData = {
      date: new Date(),
      description: `Payment for Invoice #${transaction.transactionNumber}`,
      type: 'payment' as const,
      status: 'posted' as const,
      relatedInvoiceId: transaction._id,
      lines: [
        {
          accountId: checkingAccount._id,
          accountName: checkingAccount.name,
          accountNumber: checkingAccount.accountNumber,
          debit: amount,
          credit: 0,
          description: `Payment from ${transaction.clientName}`
        } as any,
        {
          accountId: accountsReceivable._id,
          accountName: accountsReceivable.name,
          accountNumber: accountsReceivable.accountNumber,
          debit: 0,
          credit: amount,
          description: `Payment for Invoice #${transaction.transactionNumber}`
        } as any
      ]
    };
    
    await AccountingService.createTransaction(userId, paymentTransactionData);
    
    // Update account balances
    await AccountingService.updateAccountBalances(userId);
  }
} 