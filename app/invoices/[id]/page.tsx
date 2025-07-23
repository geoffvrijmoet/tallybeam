'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  description: string;
  notes?: string;
  status: string;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-gray-600">Professional Invoice from TallyBeam</p>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h2>
                <p className="text-sm text-gray-600">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Invoice Date: {formatDate(invoice.issueDate)}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
                <p className="text-lg font-medium text-gray-900">{invoice.clientName}</p>
                {invoice.clientEmail && (
                  <p className="text-sm text-gray-600">{invoice.clientEmail}</p>
                )}
              </div>
              <div className="md:text-right">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium capitalize ${
                      invoice.status === 'paid' ? 'text-green-600' :
                      invoice.status === 'overdue' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-lg p-1">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white rounded-md">
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900 rounded-l-md">
                        {invoice.description}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right rounded-r-md">
                        {invoice.currency} {invoice.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-300">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-base font-bold text-gray-900">
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            {invoice.paymentMethod === 'venmo' && (
              <div className="bg-blue-50 rounded-lg p-4 mb-8">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Instructions</h4>
                <div className="text-sm text-blue-800">
                  <p className="mb-2">Please send payment via:</p>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Venmo</span>
                    <span className="font-mono text-blue-900">
                      @{invoice.venmoUsername || 'yourvenmo'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
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