import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF to match InvoicePreview exactly
const styles = StyleSheet.create({
  page: {
    padding: 32, // Match the p-8 (32px) from preview
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#333',
  },
  // Header matching InvoicePreview layout
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32, // mb-8
  },
  invoiceTitle: {
    fontSize: 24, // text-3xl
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 10, // text-sm
    color: '#4b5563', // text-gray-600
  },
  invoiceDateSection: {
    textAlign: 'right',
  },
  invoiceDateLabel: {
    fontSize: 10, // text-sm
    color: '#4b5563', // text-gray-600
  },
  // Invoice Details section
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32, // mb-8
  },
  billToSection: {
    width: '48%',
  },
  billToHeader: {
    fontSize: 10, // text-sm
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    color: '#374151', // text-gray-700
  },
  billToName: {
    fontSize: 12, // text-lg
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
  },
  dueDateSection: {
    width: '48%',
    textAlign: 'right',
  },
  dueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dueDateLabel: {
    fontSize: 10, // text-sm
    color: '#4b5563', // text-gray-600
  },
  dueDateValue: {
    fontSize: 10, // text-sm
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
  },
  // Table styling to match preview
  tableContainer: {
    marginBottom: 32, // mb-8
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: 8, // rounded-lg
    padding: 4, // p-1
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
  },
  tableHeaderText: {
    fontSize: 9, // text-xs
    fontFamily: 'Inter-Bold',
    color: '#374151', // text-gray-700
    textTransform: 'uppercase',
  },
  tableHeaderDesc: {
    width: '70%',
  },
  tableHeaderAmount: {
    width: '30%',
    textAlign: 'right',
  },
  tableRowContainer: {
    backgroundColor: '#ffffff', // bg-white
    borderRadius: 6, // rounded-md
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, // px-4
    paddingVertical: 16, // py-4
  },
  tableDescCell: {
    width: '70%',
    fontSize: 10, // text-sm
    color: '#111827', // text-gray-900
  },
  tableAmountCell: {
    width: '30%',
    fontSize: 10, // text-sm
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
    textAlign: 'right',
  },
  // Total section matching preview
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 32, // mb-8
  },
  totalBox: {
    width: 160, // w-64 equivalent
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8, // py-2
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // border-gray-200
  },
  totalLabel: {
    fontSize: 10, // text-sm
    color: '#4b5563', // text-gray-600
  },
  totalValue: {
    fontSize: 10, // text-sm
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8, // py-2
    borderTopWidth: 2,
    borderTopColor: '#d1d5db', // border-gray-300
  },
  totalFinalLabel: {
    fontSize: 12, // text-base
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
  },
  totalFinalValue: {
    fontSize: 12, // text-base
    fontFamily: 'Inter-Bold',
    color: '#111827', // text-gray-900
  },
  // Payment section matching preview blue box
  paymentSection: {
    backgroundColor: '#dbeafe', // bg-blue-50
    borderRadius: 8, // rounded-lg
    padding: 16, // p-4
    marginBottom: 32,
  },
  paymentTitle: {
    fontSize: 10, // text-sm
    fontFamily: 'Inter-Bold',
    color: '#1e3a8a', // text-blue-900
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 10, // text-sm
    color: '#1e40af', // text-blue-800
    marginBottom: 8,
  },
  paymentVenmoText: {
    fontSize: 10, // text-sm
    color: '#1e40af', // text-blue-800
    fontFamily: 'Inter-Bold',
  },
  notesSection: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    fontSize: 10,
    color: '#555',
    lineHeight: 1.4,
  },
  notesTitle: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888',
  },
});

// Invoice interface matching TallyBeam's structure
interface TallyBeamInvoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  currency: string;
  dueDate: Date;
  issueDate: Date;
  description: string;
  notes?: string;
  status: string;
  paymentMethod?: string;
  venmoUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceDocumentProps {
  invoice: TallyBeamInvoice;
}

// Helper functions
const formatDate = (dateInput: Date | string): string => {
  if (!dateInput) return 'N/A';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return 'Invalid Date';
  }
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice }) => {
  return (
    <Document title={`Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header - matching InvoicePreview exactly */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceDateSection}>
            <Text style={styles.invoiceDateLabel}>
              Invoice Date: {formatDate(invoice.issueDate)}
            </Text>
          </View>
        </View>

        {/* Invoice Details - matching two-column layout */}
        <View style={styles.detailsSection}>
          <View style={styles.billToSection}>
            <Text style={styles.billToHeader}>Bill To:</Text>
            <Text style={styles.billToName}>{invoice.clientName}</Text>
          </View>
          <View style={styles.dueDateSection}>
            <View style={styles.dueDateRow}>
              <Text style={styles.dueDateLabel}>Due Date:</Text>
              <Text style={styles.dueDateValue}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Items Table - matching preview styling exactly */}
        <View style={styles.tableContainer}>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableHeaderDesc]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderAmount]}>
                Amount
              </Text>
            </View>
            {/* Data Row */}
            <View style={styles.tableRowContainer}>
              <View style={styles.tableRow}>
                <Text style={styles.tableDescCell}>
                  {invoice.description}
                </Text>
                <Text style={styles.tableAmountCell}>
                  ${invoice.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Totals - matching preview layout */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ${invoice.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Total:</Text>
              <Text style={styles.totalFinalValue}>
                ${invoice.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Instructions - matching blue box styling */}
        {invoice.paymentMethod === 'venmo' && invoice.venmoUsername && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Instructions</Text>
            <Text style={styles.paymentText}>
              Please send payment via:
            </Text>
            <Text style={styles.paymentVenmoText}>
              Venmo @{invoice.venmoUsername}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}; 