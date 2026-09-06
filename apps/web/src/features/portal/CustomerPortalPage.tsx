import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import {
  FileText,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Tag,
  Package,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Alert, Badge } from '../../components/ui/index.js';

interface SanitizedPortalQuoteLine {
  id: string;
  productId: string;
  quantity: number;
  listPrice: number;
  unitPrice?: number;
  proposedDiscountPercent: number;
  discountAmount: number;
  taxRate?: number;
  taxAmount?: number;
  netLinePrice: number;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    billingType: string;
  };
}

interface CounterOfferHistory {
  id: string;
  proposedDiscountPercent: number;
  customerNotes: string | null;
  status: string;
  createdAt: string;
}

interface SanitizedPortalQuote {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  totalDiscount: number;
  taxableAmount?: number;
  taxAmount?: number;
  netValue: number;
  customer: {
    id: string;
    name: string;
    code: string;
    tier: string;
  };
  lines: SanitizedPortalQuoteLine[];
  counterOffers: CounterOfferHistory[];
}

export const CustomerPortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [quote, setQuote] = useState<SanitizedPortalQuote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Counteroffer form state
  const [isCounterModalOpen, setIsCounterModalOpen] = useState<boolean>(false);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  
  // Line-level counter state
  const [lineDiscounts, setLineDiscounts] = useState<Record<string, { discount: number; qty: number }>>({});
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const fetchPortalQuote = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: SanitizedPortalQuote }>(
        `/portal/quotes/${token}`,
      );

      if (res.data.success) {
        setQuote(res.data.data);
        
        // Initialize line states
        const initialLines: Record<string, { discount: number; qty: number }> = {};
        res.data.data.lines.forEach((l) => {
          initialLines[l.id] = {
            discount: l.proposedDiscountPercent,
            qty: l.quantity,
          };
        });
        setLineDiscounts(initialLines);
      }
    } catch (err: any) {
      console.error('Failed to load portal quotation:', err);
      setError(
        err.response?.data?.message ||
          'Unable to load quotation. Link may be invalid or expired.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortalQuote();
  }, [fetchPortalQuote]);

  const handleSubmitCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !quote) return;

    try {
      setIsSubmitting(true);
      setSubmitSuccess(null);
      
      const linesArray = Object.keys(lineDiscounts).map((id) => ({
        lineId: id,
        proposedDiscountPercent: lineDiscounts[id].discount,
        quantity: lineDiscounts[id].qty,
      }));

      const res = await api.post<{
        success: boolean;
        data: SanitizedPortalQuote;
        message: string;
      }>(`/portal/quotes/${token}/counter-offer`, {
        lineDiscounts: linesArray,
        customerNotes,
      });

      if (res.data.success) {
        setQuote(res.data.data);
        setSubmitSuccess(res.data.message);
        setIsCounterModalOpen(false);
        setCustomerNotes('');
      }
    } catch (err: any) {
      console.error('Failed to submit counteroffer:', err);
      setError(err.response?.data?.message || 'Failed to submit counteroffer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLine = (id: string, field: 'discount' | 'qty', value: number) => {
    setLineDiscounts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Sales Proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-rose-200">
          <CardBody className="text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500">{error || 'Invalid or expired portal token.'}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Brand Banner */}
        <div className="bg-[#714B67] text-white p-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShieldCheck className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DealFlow360 Customer Portal</h1>
              <p className="text-xs text-slate-200 mt-0.5">
                Official governed commercial quotation for {quote.customer.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Tag className="w-3.5 h-3.5 text-amber-300" />
            Quotation #{quote.quoteNumber}
          </div>
        </div>

        {submitSuccess && (
          <Alert type="success" className="mb-4">
            {submitSuccess}
          </Alert>
        )}

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <Card>
            <CardBody className="p-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-400" /> Subtotal (Gross)
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${quote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                Taxable Base
              </span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                ${(quote.taxableAmount || (quote.subtotal - quote.totalDiscount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                Tax
              </span>
              <p className="text-xl font-bold font-mono text-blue-700 mt-1">
                +${(quote.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-500" /> Total Discount
              </span>
              <p className="text-xl font-bold font-mono text-amber-700 mt-1">
                -${quote.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-l-[#714B67]">
            <CardBody className="p-4">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#714B67]" /> Grand Total
              </span>
              <p className="text-xl font-bold font-mono text-[#714B67] mt-1">
                ${quote.netValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Itemized Line Items Table */}
        <Card>
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" /> Itemized Proposal Breakdown ({quote.lines.length} items)
            </h2>
            <Button
              onClick={() => setIsCounterModalOpen(true)}
              variant="primary"
              size="sm"
              disabled={!['DRAFT', 'NEGOTIATING', 'APPROVED'].includes(quote.status)}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-2 inline" /> 
              Propose Counteroffer
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-5">Product / Service</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Selling Unit Price</th>
                  <th className="py-3 px-4 text-right">Tax</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-5 text-right">Net Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {quote.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-5 font-sans">
                      <div className="font-semibold text-slate-900">{line.product.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        SKU: {line.product.sku} • {line.product.billingType}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center text-slate-900 font-bold">
                      {line.quantity}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-700">
                      ${(line.unitPrice || line.listPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-700">
                      <div>+${(line.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-slate-400">({line.taxRate || 0}%)</div>
                    </td>
                    <td className="py-4 px-4 text-right text-amber-700 font-bold">
                      {line.proposedDiscountPercent}%
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-[#714B67]">
                      ${line.netLinePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Counteroffer History */}
        {quote.counterOffers.length > 0 && (
          <Card>
            <CardHeader title="Negotiation History" />
            <CardBody className="space-y-3">
              {quote.counterOffers.map((co) => (
                <div
                  key={co.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900">
                      Counteroffer Request (Avg Disc: {co.proposedDiscountPercent}%)
                    </span>
                    <Badge variant="default">{new Date(co.createdAt).toLocaleDateString()}</Badge>
                  </div>
                  {co.customerNotes && (
                    <p className="text-slate-600 italic mt-1">"{co.customerNotes}"</p>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Counteroffer Modal */}
      {isCounterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#714B67]" /> Propose Commercial Terms
              </h3>
              <button
                onClick={() => setIsCounterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitCounterOffer}>
              <CardBody className="space-y-6">
                <Alert type="info" title="Commercial Review Required">
                  Counter-offers may be subject to additional management or financial approvals based on the requested discounts.
                </Alert>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Line Items</h4>
                  <div className="space-y-3">
                    {quote.lines.map(line => (
                      <div key={line.id} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{line.product.name}</p>
                          <p className="text-xs text-slate-500">${line.listPrice} list</p>
                        </div>
                        <div className="w-24">
                          <Input
                            label="Qty"
                            type="number"
                            min="1"
                            value={lineDiscounts[line.id]?.qty || line.quantity}
                            onChange={(e) => updateLine(line.id, 'qty', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            label="Discount %"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={lineDiscounts[line.id]?.discount ?? line.proposedDiscountPercent}
                            onChange={(e) => updateLine(line.id, 'discount', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Comments / Commercial Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded shadow-xs focus:ring-[#714B67] focus:border-[#714B67]"
                    placeholder="Provide justification or additional context for your request..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>
              </CardBody>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCounterModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Submit Proposal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
