import { ParsedInvoiceData } from '../lib/services/ai';
import { useState } from 'react';
import { createEasternDate, createTodayEasternDateString, createFutureDateString } from '../lib/utils';
import { InvoiceDisplay } from './InvoiceDisplay';

interface InvoicePreviewProps {
  data: ParsedInvoiceData;
  invoiceNumber?: string;
}

export function InvoicePreview({ data, invoiceNumber }: InvoicePreviewProps) {
  const [venmoUsername, setVenmoUsername] = useState('yourvenmo');
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [customDueDate, setCustomDueDate] = useState<string | null>(null);
  const [customInvoiceDate, setCustomInvoiceDate] = useState<string | null>(null);

  // Use custom due date if set, otherwise use parsed data or default to 30 days from now in Eastern time
  const effectiveDueDate = customDueDate || data.dueDate || createFutureDateString(30);
  
  // Use custom invoice date if set, otherwise use today's date in Eastern time
  const effectiveInvoiceDate = customInvoiceDate || createTodayEasternDateString();

  const handleCopyLink = async () => {
    try {
      setIsCreatingLink(true);
      
      // Create invoice in database
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: data.clientName,
          amount: data.amount,
          description: data.description,
          dueDate: effectiveDueDate,
          issueDate: effectiveInvoiceDate,
          paymentMethod: 'venmo',
          venmoUsername: venmoUsername,
          currency: 'USD'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const result = await response.json();
      setCreatedInvoiceId(result._id);

      // Copy link to clipboard
      const invoiceUrl = `${window.location.origin}/invoices/${result.id}`;
      await navigator.clipboard.writeText(invoiceUrl);

      // Show success feedback (you could add a toast notification here)
      alert(`Invoice created! Link copied to clipboard:\n${invoiceUrl}`);

    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);

      let invoiceId = createdInvoiceId;

      // If no invoice created yet, create one first
      if (!invoiceId) {
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientName: data.clientName,
            amount: data.amount,
            description: data.description,
            dueDate: effectiveDueDate,
            issueDate: effectiveInvoiceDate,
            paymentMethod: 'venmo',
            venmoUsername: venmoUsername,
            currency: 'USD'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create invoice');
        }

        const result = await response.json();
        invoiceId = result._id;
        setCreatedInvoiceId(result._id);
      } else {
        // If invoice exists and we have custom dates, update the existing invoice
        const hasCustomDates = customDueDate || customInvoiceDate;
        
        if (hasCustomDates) {
          const updateResponse = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dueDate: effectiveDueDate,
              issueDate: effectiveInvoiceDate,
            }),
          });

          if (!updateResponse.ok) {
            throw new Error('Failed to update invoice');
          }
        }
      }

      // Generate and download PDF
      const pdfUrl = `/api/invoices/${invoiceId}/pdf`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${data.clientName.toLowerCase().replace(/\s+/g, '-')}-invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDateUpdate = (field: 'dueDate' | 'issueDate', value: string) => {
    if (field === 'dueDate') {
      setCustomDueDate(value);
    } else {
      setCustomInvoiceDate(value);
    }
  };

  const handleVenmoUpdate = (username: string) => {
    setVenmoUsername(username);
  };

  // Convert parsed data to the format expected by InvoiceDisplay
  const invoiceData = {
    clientName: data.clientName,
    clientEmail: undefined,
    amount: data.amount,
    description: data.description,
    notes: undefined,
    currency: 'USD',
    paymentMethod: 'venmo',
    venmoUsername: venmoUsername,
  };

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
      {/* Preview Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Invoice Preview</span>
          </div>
          <div className="text-xs text-gray-500">What your client will see</div>
        </div>
      </div>

      {/* Invoice Display */}
      <InvoiceDisplay
        data={invoiceData}
        invoiceNumber={invoiceNumber}
        dueDate={effectiveDueDate}
        issueDate={effectiveInvoiceDate}
        isEditable={true}
        onDateUpdate={handleDateUpdate}
        onVenmoUpdate={handleVenmoUpdate}
      />

      {/* Preview Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="text-xs text-gray-500">
            This preview shows how your invoice will appear to {data.clientName}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Details</span>
            </button>
            <button 
              onClick={createdInvoiceId ? async () => {
                // Re-copy existing invoice link
                const invoiceUrl = `${window.location.origin}/invoices/${createdInvoiceId}`;
                await navigator.clipboard.writeText(invoiceUrl);
                alert(`Link copied to clipboard:\n${invoiceUrl}`);
              } : handleCopyLink}
              disabled={isCreatingLink}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 disabled:opacity-50 disabled:transform-none disabled:hover:bg-green-600"
            >
              {isCreatingLink ? (
                <>
                  <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : createdInvoiceId ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1 text-xs bg-violet-600 text-white rounded-md hover:bg-violet-700 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 disabled:opacity-50 disabled:transform-none disabled:hover:bg-violet-600"
            >
              {isGeneratingPdf ? (
                <>
                  <svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 