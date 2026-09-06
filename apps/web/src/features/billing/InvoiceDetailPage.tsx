import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import { InvoiceDto, InvoiceStatus } from '@dealflow360/contracts';
import {
  ArrowLeft,
  FileCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  Printer,
  DollarSign,
  Send,
  Loader2,
  FileText,
  AlertCircle,
  FileDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';
import { downloadInvoicePdf, downloadInvoiceXlsx } from './exportUtils.js';
import { PaymentModal } from './components/PaymentModal.js';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActing, setIsActing] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: InvoiceDto }>(`/invoices/${id}`);
      if (res.data.success) {
        setInvoice(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch invoice:', err);
      setError(err.response?.data?.error?.message || 'Invoice not found');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleIssueInvoice = async () => {
    if (!invoice) return;
    try {
      setIsActing(true);
      setActionSuccess(null);
      const res = await api.post<{ success: boolean; data: InvoiceDto; message: string }>(
        `/invoices/${invoice.id}/issue`,
      );
      if (res.data.success) {
        setInvoice(res.data.data);
        setActionSuccess('Invoice successfully issued');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to issue invoice');
    } finally {
      setIsActing(false);
    }
  };

  const handleRecordPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchInvoice();
    setActionSuccess('Payment recorded successfully');
  };

  const handleVoidInvoice = async () => {
    if (!invoice) return;
    const reason = window.prompt('Please enter reason for voiding this invoice:');
    if (reason === null) return;

    try {
      setIsActing(true);
      setActionSuccess(null);
      const res = await api.post<{ success: boolean; data: InvoiceDto; message: string }>(
        `/invoices/${invoice.id}/void`,
        { reason },
      );
      if (res.data.success) {
        setInvoice(res.data.data);
        setActionSuccess('Invoice voided successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to void invoice');
    } finally {
      setIsActing(false);
    }
  };

  const handleExportPdf = async () => {
    if (!invoice) return;
    try {
      setIsExportingPdf(true);
      await downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch (err: any) {
      console.error('Failed to export PDF:', err);
      setError('Failed to download PDF export');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportXlsx = async () => {
    if (!invoice) return;
    try {
      setIsExportingXlsx(true);
      await downloadInvoiceXlsx(invoice.id, invoice.invoiceNumber);
    } catch (err: any) {
      console.error('Failed to export XLSX:', err);
      setError('Failed to download Excel export');
    } finally {
      setIsExportingXlsx(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-xs font-medium text-slate-600">Loading Invoice Snapshot...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Invoice Not Found</h3>
          <p className="text-xs text-rose-700 mt-1">{error || 'The requested invoice does not exist.'}</p>
        </div>
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Invoice Dashboard
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'ISSUED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> ISSUED
          </span>
        );
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> PAID
          </span>
        );
      case 'VOID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" /> VOIDED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> DRAFT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Action Header (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Invoices"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-slate-900">{invoice.invoiceNumber}</h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial Commercial Snapshot &bull; Preserves approved quotation rates
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Export Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 text-purple-900 bg-purple-50 border border-purple-200 hover:bg-purple-100 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-purple-700" />}
            Download PDF
          </button>

          {/* XLSX Export Button */}
          <button
            onClick={handleExportXlsx}
            disabled={isExportingXlsx}
            className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isExportingXlsx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />}
            Export XLSX
          </button>

          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleIssueInvoice}
              disabled={isActing}
              className="inline-flex items-center gap-1.5 bg-[#714B67] hover:bg-[#5b3c53] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Issue Invoice
            </button>
          )}

          {invoice.status === 'ISSUED' && (
            <button
              onClick={handleRecordPayment}
              disabled={isActing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              <DollarSign className="w-3.5 h-3.5" /> Record Payment
            </button>
          )}

          {(invoice.status === 'DRAFT' || invoice.status === 'ISSUED') && (
            <button
              onClick={handleVoidInvoice}
              disabled={isActing}
              className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" /> Void
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* Printable Invoice Document Body */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#714B67] text-white font-bold flex items-center justify-center text-sm">
                DF
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">DealFlow<span className="text-[#714B67]">360</span></span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Commercial Deal & Sales-to-Cash Governance
            </p>
            <p className="text-xs text-slate-400">Tax Invoice & Financial Snapshot</p>
          </div>

          <div className="sm:text-right space-y-1">
            <h2 className="text-2xl font-bold font-mono text-slate-900">{invoice.invoiceNumber}</h2>
            <div className="text-xs text-slate-500 font-mono">
              Issue Date: <span className="font-semibold text-slate-800">{new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            {invoice.dueDate && (
              <div className="text-xs text-slate-500 font-mono">
                Due Date: <span className="font-semibold text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {invoice.quotation && (
              <div className="text-xs text-[#714B67] font-semibold mt-1">
                Ref Quote:{' '}
                <Link to={`/quotations/${invoice.quotationId}`} className="underline font-mono">
                  {invoice.quotation.quoteNumber || invoice.quotationId}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Billing Snapshot Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Billed To (Customer Snapshot)</span>
            <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#714B67]" />
              {invoice.customerName}
            </h3>
            <div className="text-slate-600 mt-1 space-y-0.5">
              <div>Email: {invoice.customerEmail}</div>
              {invoice.customerPhone && <div>Phone: {invoice.customerPhone}</div>}
              <div>Region: {invoice.customerRegion}</div>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Commercial Tier & Status</span>
            <div className="mt-1">
              <Badge variant="purple" size="sm">{invoice.customerTier} TIER</Badge>
            </div>
            <div className="mt-2 text-slate-500">
              Payment Terms: <span className="font-semibold text-slate-800">Net 14 Days</span>
            </div>
          </div>
        </div>

        {/* Itemized Invoice Line Items Table */}
        <div className="space-y-3">
          <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Line Items</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Tax</th>
                  <th className="py-3 px-3 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {invoice.lines?.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{line.productName}</div>
                      <div className="text-slate-400 text-[11px]">SKU: {line.productSku}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-semibold text-slate-800">
                      {line.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ${line.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      +${line.taxAmount.toFixed(2)}
                      <div className="text-[10px] text-slate-400">({line.taxRate}%)</div>
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 font-medium">
                      {line.proposedDiscountPercent}%
                      <div className="text-[10px] text-slate-400">(-${line.discountAmount.toFixed(2)})</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ${line.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Reconciliation Box */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4">
          <div className="text-xs text-slate-500 max-w-sm">
            {invoice.notes && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-amber-900">
                <span className="font-semibold block mb-0.5">Notes / Terms:</span>
                {invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span>${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-blue-700">
              <span>Total Tax:</span>
              <span>+${invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-slate-800 border-t border-slate-200 pt-1.5 font-semibold">
              <span>Price After Tax:</span>
              <span>${(invoice.subtotal + invoice.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-amber-700">
              <span>Total Discount:</span>
              <span>-${invoice.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-slate-900 font-bold text-base border-t-2 border-slate-900 pt-2">
              <span>NET TOTAL:</span>
              <span className="text-emerald-800">${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
      {isPaymentModalOpen && invoice && (
        <PaymentModal
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          outstandingAmount={
            invoice.totalAmount - ((invoice as any).payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0)
          }
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
