import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import { RecommendationItem } from '@dealflow360/contracts';
import { UpsellPanel } from './components/UpsellPanel.js';
import {
  FileText,
  Building2,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Package,
  Trash2,
  Send,
  Loader2,
  FileSpreadsheet,
  Truck,
  FileCheck,
} from 'lucide-react';

interface QuoteLineData {
  id: string;
  productId: string;
  quantity: number;
  listPrice: number;
  unitPrice: number;
  proposedDiscountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  netLinePrice: number;
  lineCost: number;
  lineMarginPercent: number;
  product: {
    name: string;
    sku: string;
    category: string;
    billingType: string;
  };
}

interface QuotationData {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  netValue: number;
  grossMarginPercent: number;
  riskScore: number;
  riskLevel: string;
  customer: {
    name: string;
    tier: string;
    region: string;
  };
  lines: QuoteLineData[];
}

export const QuotationViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRecsLoading, setIsRecsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingInvoice, setExistingInvoice] = useState<{ id: string; invoiceNumber: string } | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false);

  const quoteId = id || 'quote-sample-001';

  const fetchQuotationData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader || !quotation) {
        setIsLoading(true);
      } else {
        setIsUpdating(true);
      }
      setError(null);
      const res = await api.get<{ success: boolean; data: QuotationData }>(
        `/quotes/${quoteId}`,
      );
      if (res.data.success) {
        setQuotation(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load quotation:', err);
      if (!quotation) {
        setError(err.response?.data?.message || 'Failed to load quotation');
      }
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  }, [quoteId, quotation]);

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsRecsLoading(true);
      const res = await api.get<{ success: boolean; data: RecommendationItem[] }>(
        `/quotes/${quoteId}/recommendations`,
      );
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsRecsLoading(false);
    }
  }, [quoteId]);

  const fetchExistingInvoice = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: any }>(`/invoices/quotation/${quoteId}`);
      if (res.data.success && res.data.data) {
        setExistingInvoice(res.data.data);
      } else {
        setExistingInvoice(null);
      }
    } catch {
      setExistingInvoice(null);
    }
  }, [quoteId]);

  useEffect(() => {
    fetchQuotationData(true);
    fetchRecommendations();
    fetchExistingInvoice();
  }, [quoteId]);

  const handleAddRecommendation = async (rec: RecommendationItem) => {
    try {
      setIsUpdating(true);
      await api.post(`/quotes/${quoteId}/lines`, {
        productId: rec.productId,
        quantity: 1,
        proposedDiscountPercent: rec.promotionDiscountPercent || 0,
      });
      await fetchQuotationData(false);
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to add recommendation:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateLine = async (
    lineId: string,
    quantity?: number,
    unitPrice?: number,
    proposedDiscountPercent?: number,
  ) => {
    if (!quotation) return;

    // Optimistic local state update for zero-latency UI updates without focus loss
    const updatedLines = quotation.lines.map((line) => {
      if (line.id !== lineId) return line;

      const qty = quantity !== undefined ? Math.max(1, quantity) : line.quantity;
      const price = unitPrice !== undefined ? Math.max(0, unitPrice) : (line.unitPrice || line.listPrice);
      const discPct = proposedDiscountPercent !== undefined ? Math.min(100, Math.max(0, proposedDiscountPercent)) : line.proposedDiscountPercent;
      const taxPct = line.taxRate || 0;

      const lineGross = price * qty;
      const lineTaxable = lineGross;
      const lineTax = (lineTaxable * taxPct) / 100;
      const grossWithTax = lineGross + lineTax;
      const discAmt = (grossWithTax * discPct) / 100;
      const netLine = grossWithTax - discAmt;

      return {
        ...line,
        quantity: qty,
        unitPrice: price,
        proposedDiscountPercent: discPct,
        discountAmount: discAmt,
        taxAmount: lineTax,
        netLinePrice: netLine,
      };
    });

    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let taxAmount = 0;
    let netValue = 0;

    for (const line of updatedLines) {
      const price = line.unitPrice || line.listPrice;
      const lineGross = price * line.quantity;
      const lineTaxable = lineGross;
      const lineTax = (lineTaxable * (line.taxRate || 0)) / 100;
      const grossWithTax = lineGross + lineTax;
      const discAmt = (grossWithTax * line.proposedDiscountPercent) / 100;
      const netLine = grossWithTax - discAmt;

      subtotal += lineGross;
      totalDiscount += discAmt;
      taxableAmount += lineTaxable;
      taxAmount += lineTax;
      netValue += netLine;
    }

    setQuotation({
      ...quotation,
      subtotal,
      totalDiscount,
      taxableAmount,
      taxAmount,
      netValue,
      lines: updatedLines,
    });

    try {
      setIsUpdating(true);
      const res = await api.patch<{ success: boolean; data: QuotationData }>(
        `/quotes/${quoteId}/lines/${lineId}`,
        {
          quantity,
          unitPrice,
          proposedDiscountPercent,
        },
      );
      if (res.data.success) {
        setQuotation(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to update line:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    if (!quotation) return;

    // Optimistically remove line locally
    const filteredLines = quotation.lines.filter((l) => l.id !== lineId);
    setQuotation({
      ...quotation,
      lines: filteredLines,
    });

    try {
      setIsUpdating(true);
      const res = await api.delete<{ success: boolean; data: QuotationData }>(
        `/quotes/${quoteId}/lines/${lineId}`,
      );
      if (res.data.success) {
        setQuotation(res.data.data);
      }
      await fetchRecommendations();
    } catch (err: any) {
      console.error('Failed to delete line:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitQuote = async () => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      const res = await api.post<{ success: boolean; data: QuotationData; message: string }>(
        `/quotes/${quoteId}/submit`,
      );
      if (res.data.success) {
        setQuotation(res.data.data);
        setSubmitMessage(res.data.message);
      }
    } catch (err: any) {
      console.error('Failed to submit quote:', err);
      setError(err.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!quotation) return;
    try {
      setIsCreatingInvoice(true);
      const res = await api.post<{ success: boolean; data: { id: string; invoiceNumber: string } }>(
        '/invoices',
        { quotationId: quotation.id },
      );
      if (res.data.success && res.data.data) {
        navigate(`/invoices/${res.data.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create invoice:', err);
      setError(err.response?.data?.error?.message || 'Failed to create invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading Commercial Quotation...</p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="font-semibold text-lg">Quotation Not Found</h3>
          <p className="text-sm">{error || 'The requested quotation does not exist.'}</p>
        </div>
        <button
          onClick={() => navigate('/quotations')}
          className="inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Quotation List
        </button>
      </div>
    );
  }

  const isRiskHigh = quotation.riskLevel === 'HIGH';
  const isRiskMedium = quotation.riskLevel === 'MEDIUM';
  const isDraft = quotation.status === 'DRAFT';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Quotation List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {quotation.quoteNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${quotation.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : quotation.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : quotation.status.startsWith('PENDING')
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
              >
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {quotation.customer.name} ({quotation.customer.tier} Tier)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Risk Badge */}
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-medium ${isRiskHigh
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : isRiskMedium
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
          >
            {isRiskHigh ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            )}
            <div>
              <span className="font-bold">{quotation.riskLevel} RISK</span>
              <span className="font-mono ml-1.5 opacity-80">({quotation.riskScore}/10)</span>
            </div>
          </div>

          {isDraft && (
            <button
              onClick={handleSubmitQuote}
              disabled={isSubmitting || quotation.lines.length === 0}
              className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-xs shadow-xs transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit Quote
            </button>
          )}

          <button
            onClick={() => navigate(`/quotations/${quotation.id}/fulfillment`)}
            className="inline-flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs"
            title="View Fulfillment Allocation"
          >
            <Truck className="w-3.5 h-3.5 text-[#714B67]" /> Fulfillment Split
          </button>

          <button
            onClick={() => navigate(`/quotations/${quotation.id}/billing`)}
            className="inline-flex items-center gap-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs"
            title="View Billing Schedule"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#714B67]" /> Billing Schedule
          </button>

          {existingInvoice ? (
            <button
              onClick={() => navigate(`/invoices/${existingInvoice.id}`)}
              className="inline-flex items-center gap-1.5 text-white bg-[#714B67] hover:bg-[#5b3c53] px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="View Financial Invoice"
            >
              <FileCheck className="w-3.5 h-3.5" /> View Invoice ({existingInvoice.invoiceNumber})
            </button>
          ) : (
            ['APPROVED', 'FULFILLMENT', 'BILLING', 'COMPLETED'].includes(quotation.status) && (
              <button
                onClick={handleCreateInvoice}
                disabled={isCreatingInvoice}
                className="inline-flex items-center gap-1.5 text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Generate Financial Snapshot Invoice"
              >
                {isCreatingInvoice ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCheck className="w-3.5 h-3.5" />
                )}
                Create Invoice
              </button>
            )
          )}

          <button
            onClick={() => {
              fetchQuotationData();
              fetchRecommendations();
            }}
            className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            title="Refresh quotation data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {submitMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          {submitMessage}
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Subtotal (Gross)
          </span>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            ${quotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            Tax
          </span>
          <p className="text-lg font-bold text-blue-700 font-mono mt-1">
            +${(quotation.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            Price After Tax
          </span>
          <p className="text-lg font-bold text-slate-800 font-mono mt-1">
            ${(quotation.subtotal + (quotation.taxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Discount
          </span>
          <p className="text-lg font-bold text-amber-700 font-mono mt-1">
            -${quotation.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Grand Total
          </span>
          <p className="text-lg font-bold text-emerald-800 font-mono mt-1">
            ${quotation.netValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Main Grid: Quote Lines + Upsell Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quote Line Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-600" />
                Quotation Line Items ({quotation.lines.length})
                {isUpdating && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-normal text-[#714B67] ml-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                )}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-right">Tax</th>
                    <th className="py-3 px-3 text-right">Disc %</th>
                    <th className="py-3 px-3 text-right">Net Total</th>
                    <th className="py-3 px-3 text-right">Margin %</th>
                    {isDraft && <th className="py-3 px-2 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {quotation.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-900">{line.product.name}</div>
                        <div className="text-slate-400 text-[11px]">SKU: {line.product.sku}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {isDraft ? (
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              handleUpdateLine(
                                line.id,
                                parseInt(e.target.value) || 1,
                                line.unitPrice || line.listPrice,
                                line.proposedDiscountPercent,
                              )
                            }
                            className="w-12 text-center border border-slate-200 rounded px-1 py-0.5 bg-slate-50 focus:border-[#714B67]"
                          />
                        ) : (
                          <span className="text-slate-800 font-semibold">{line.quantity}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isDraft ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={line.unitPrice || line.listPrice}
                            onChange={(e) =>
                              handleUpdateLine(
                                line.id,
                                line.quantity,
                                parseFloat(e.target.value) || 0,
                                line.proposedDiscountPercent,
                              )
                            }
                            className="w-20 text-right border border-slate-300 rounded px-1 py-0.5 bg-white font-bold text-slate-900 focus:border-[#714B67]"
                          />
                        ) : (
                          <span className="text-slate-900 font-bold">
                            ${(line.unitPrice || line.listPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        <div>+${(line.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-slate-400">({line.taxRate || 0}%)</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isDraft ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.proposedDiscountPercent}
                            onChange={(e) =>
                              handleUpdateLine(
                                line.id,
                                line.quantity,
                                line.unitPrice || line.listPrice,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-14 text-right border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-amber-700 font-bold focus:border-[#714B67]"
                          />
                        ) : (
                          <span className="text-amber-700 font-semibold">
                            {line.proposedDiscountPercent}%
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ${line.netLinePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-purple-700">
                        {line.lineMarginPercent}%
                      </td>
                      {isDraft && (
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleDeleteLine(line.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upsell & Cross-Sell Panel */}
        <div className="lg:col-span-5">
          <UpsellPanel
            recommendations={recommendations}
            isLoading={isRecsLoading}
            onAddRecommendation={handleAddRecommendation}
            currencySymbol="$"
          />
        </div>
      </div>
    </div>
  );
};
