'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceDisplay } from '../../../components/InvoiceDisplay';

interface Invoice {
  _id: string;
  transactionNumber: string;
  clientName: string;
  clientEmail?: string;
  totalDebit: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  description: string;
  notes?: string;
  invoiceStatus: string;
  paymentMethod?: string;
  venmoUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

  const fetchInvoice = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${id}`);
      
      if (!response.ok) {
        throw new Error('Invoice not found');
      }

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: any) => {
    if (!invoice) return;
    
    try {
      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoice(updatedInvoice.invoice);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The invoice you are looking for does not exist.'}</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            ← Create New Invoice
          </a>
        </div>
      </div>
    );
  }

  // Convert invoice data to the format expected by InvoiceDisplay
  const invoiceData = {
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    amount: invoice.totalDebit,
    description: invoice.description,
    notes: invoice.notes,
    currency: invoice.currency,
    paymentMethod: invoice.paymentMethod,
    venmoUsername: invoice.venmoUsername,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice #{invoice.transactionNumber}</h1>
          <p className="text-gray-600">Professional Invoice from TallyBeam</p>
        </div>

        {/* Invoice Display */}
        <InvoiceDisplay
          data={invoiceData}
          invoiceNumber={invoice.transactionNumber}
          dueDate={invoice.dueDate}
          issueDate={invoice.issueDate}
          isEditable={true}
          onUpdate={handleUpdate}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <a 
            href="/" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Create New Invoice
          </a>
          <button 
            onClick={() => window.print()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            🖨️ Print Invoice
          </button>
          <a 
            href={`/api/invoices/${invoice._id}/pdf`}
            download
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>📄</span>
            <span>Download PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
} 