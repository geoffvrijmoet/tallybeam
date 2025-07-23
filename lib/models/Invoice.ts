export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  currency: string;
  dueDate: Date;
  issueDate: Date;
  description: string;
  notes?: string;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  venmoUsername?: string; // For Venmo payment tracking
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'venmo' | 'paypal' | 'other';

export interface CreateInvoiceRequest {
  clientName: string;
  clientEmail?: string;
  amount: number;
  currency?: string;
  dueDate?: string;
  issueDate?: string;
  description: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  venmoUsername?: string;
}

export interface InvoiceListItem {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  dueDate: Date;
  status: InvoiceStatus;
  createdAt: Date;
}

export interface VenmoPayment {
  _id?: string;
  invoiceId: string;
  amount: number;
  venmoTransactionId?: string;
  email: string;
  receivedAt: Date;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

export interface EmailInvoiceRequest {
  _id?: string;
  fromEmail: string;
  subject: string;
  body: string;
  parsedData: Partial<CreateInvoiceRequest>;
  missingFields: string[];
  status: 'pending_parse' | 'needs_input' | 'completed' | 'failed';
  conversationThread: EmailInvoiceMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailInvoiceMessage {
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  type: 'original' | 'clarification_request' | 'clarification_response';
} 