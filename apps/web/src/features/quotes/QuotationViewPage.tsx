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
} from 'lucide-react';

interface QuoteLineData {
  id: string;
  productId: string;
  quantity: number;
  listPrice: number;
  proposedDiscountPercent: number;
  discountAmount: number;
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
  const [isRecsLoading, setIsRecsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const quoteId = id || 'quote-sample-001';

  const fetchQuotationData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: QuotationData }>(
        `/quotations/${quoteId}`,
      );
      if (res.data.success) {
        setQuotation(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load quotation:', err);
      setError(err.response?.data?.message || 'Failed to load quotation');
    } finally {
      setIsLoading(false);
    }
  }, [quoteId]);

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsRecsLoading(true);
      const res = await api.get<{ success: boolean; data: RecommendationItem[] }>(
        `/quotations/${quoteId}/recommendations`,
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

  useEffect(() => {
    fetchQuotationData();
    fetchRecommendations();
  }, [fetchQuotationData, fetchRecommendations]);

  const handleAddRecommendation = async (rec: RecommendationItem) => {
    await api.post(`/quotations/${quoteId}/lines`, {
      productId: rec.productId,
      quantity: 1,
      proposedDiscountPercent: rec.promotionDiscountPercent || 0,
    });
    // Recalculate quotation and recommendations
    await fetchQuotationData();
    await fetchRecommendations();
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
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    );
  }

  const isRiskHigh = quotation.riskLevel === 'HIGH';
  const isRiskMedium = quotation.riskLevel === 'MEDIUM';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {quotation.quoteNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
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
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-medium ${
              isRiskHigh
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

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Subtotal
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            ${quotation.subtotal.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" /> Total Discount
          </span>
          <p className="text-xl font-bold text-amber-700 font-mono mt-1">
            ${quotation.totalDiscount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Net Deal Value
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            ${quotation.netValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Gross Margin
          </span>
          <p className="text-xl font-bold text-purple-700 font-mono mt-1">
            {quotation.grossMarginPercent}%
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
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">List Price</th>
                    <th className="py-3 px-3 text-right">Disc %</th>
                    <th className="py-3 px-4 text-right">Net Total</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {quotation.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-900">{line.product.name}</div>
                        <div className="text-slate-400 text-[11px]">SKU: {line.product.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-800 font-semibold">
                        {line.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        ${line.listPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-700">
                        {line.proposedDiscountPercent}%
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ${line.netLinePrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-purple-700">
                        {line.lineMarginPercent}%
                      </td>
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
