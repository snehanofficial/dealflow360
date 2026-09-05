import React, { useState } from 'react';
import { RecommendationItem } from '@dealflow360/contracts';
import {
  Sparkles,
  TrendingUp,
  Tag,
  PlusCircle,
  XCircle,
  CheckCircle2,
  Info,
  Layers,
  Clock,
} from 'lucide-react';

interface UpsellPanelProps {
  recommendations: RecommendationItem[];
  isLoading: boolean;
  onAddRecommendation: (rec: RecommendationItem) => Promise<void>;
  currencySymbol?: string;
}

export const UpsellPanel: React.FC<UpsellPanelProps> = ({
  recommendations,
  isLoading,
  onAddRecommendation,
  currencySymbol = '$',
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const activeRecommendations = recommendations.filter(
    (rec) => !dismissedIds.has(rec.ruleId) && !addedIds.has(rec.ruleId),
  );

  const handleDismiss = (ruleId: string) => {
    setDismissedIds((prev) => new Set(prev).add(ruleId));
  };

  const handleAdd = async (rec: RecommendationItem) => {
    try {
      setAddingId(rec.ruleId);
      await onAddRecommendation(rec);
      setAddedIds((prev) => new Set(prev).add(rec.ruleId));
    } catch (err) {
      console.error('Failed to add recommendation:', err);
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-24 bg-slate-100 rounded-lg"></div>
        <div className="h-24 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#714B67] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/10 text-white rounded-md border border-white/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
              Upsell & Cross-Sell Recommendations
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/15 text-[#F3E9F1] border border-white/20">
                Rule-Engine Driven
              </span>
            </h2>
            <p className="text-xs text-[#F3E9F1]/80">
              Commercial impact evaluation and ranked co-purchase suggestions
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-white/10 text-white px-2.5 py-1 rounded-md border border-white/20">
          {activeRecommendations.length} Suggested
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {activeRecommendations.length === 0 ? (
          <div className="text-center py-8 px-4 bg-[#F8F9FA] rounded-md border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-[#28A745] mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-[#212529]">
              No Additional Recommendations
            </h3>
            <p className="text-xs text-[#6C757D] max-w-sm mx-auto mt-1">
              All relevant cross-sell items and active promotions have been added or dismissed for this commercial quote.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRecommendations.map((rec) => {
              const isAdding = addingId === rec.ruleId;
              const hasPromo = (rec.promotionDiscountPercent || 0) > 0;
              const marginDelta = rec.marginImpact.marginDeltaPercent;

              return (
                <div
                  key={rec.ruleId}
                  className="group relative bg-[#F8F9FA] hover:bg-white border border-slate-200 hover:border-[#714B67]/40 rounded-lg p-4 transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  {/* Top Row: Badges & Dismiss */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F3F5] text-[#6C757D]">
                        <Layers className="w-3 h-3 text-[#6C757D]" />
                        {rec.category}
                      </span>

                      {hasPromo && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30">
                          <Tag className="w-3 h-3 text-[#D97706]" />
                          {rec.promotionDiscountPercent}% Promo Bundle
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#F3E9F1] text-[#714B67] border border-[#E2CEE0]">
                        Rank #{rec.priority}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDismiss(rec.ruleId)}
                      className="text-[#6C757D] hover:text-[#212529] p-1.5 rounded-md hover:bg-[#F1F3F5] transition-colors"
                      title="Dismiss recommendation"
                      aria-label="Dismiss recommendation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Info */}
                  <div className="mb-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-[#212529] text-base">
                        {rec.productName}
                      </h3>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-[#212529]">
                          {currencySymbol}
                          {rec.marginImpact.additionalRevenue.toLocaleString()}
                        </span>
                        {hasPromo && (
                          <span className="block text-xs text-[#6C757D] line-through">
                            {currencySymbol}
                            {rec.listPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reason Metadata */}
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-[#6C757D] bg-white border border-slate-200 p-2.5 rounded-md">
                      <Info className="w-3.5 h-3.5 text-[#714B67] mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-[#212529] font-medium">Reason: </strong>
                        {rec.reason}
                      </span>
                    </div>
                  </div>

                  {/* Commercial Margin Delta Impact */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#F1F3F5] p-2.5 rounded-md mb-3 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[#6C757D] block">Revenue Impact</span>
                      <span className="font-semibold text-[#28A745] font-mono">
                        +{currencySymbol}
                        {rec.marginImpact.additionalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6C757D] block">Est. Cost</span>
                      <span className="font-medium text-[#212529] font-mono">
                        {currencySymbol}
                        {rec.marginImpact.additionalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#6C757D] block">Margin Impact</span>
                      <span
                        className={`font-semibold font-mono flex items-center gap-0.5 ${
                          marginDelta >= 0 ? 'text-[#714B67]' : 'text-[#DC3545]'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {rec.marginImpact.projectedGrossMarginPercent}% (
                        {marginDelta >= 0 ? `+${marginDelta}` : marginDelta}%)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#6C757D] font-mono">
                      {rec.billingType === 'RECURRING' ? (
                        <span className="inline-flex items-center gap-1 text-[#714B67] bg-[#F3E9F1] px-2 py-0.5 rounded border border-[#E2CEE0]">
                          <Clock className="w-3 h-3" />
                          Recurring ({rec.recurringPeriod})
                        </span>
                      ) : (
                        <span className="text-[#6C757D]">One-time product</span>
                      )}
                      <span>· SKU: {rec.sku}</span>
                    </div>

                    <button
                      onClick={() => handleAdd(rec)}
                      disabled={isAdding}
                      className="inline-flex items-center gap-1.5 bg-[#714B67] hover:bg-[#5F3D56] text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:ring-offset-2 disabled:opacity-50 min-h-[36px] cursor-pointer"
                    >
                      {isAdding ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Add to Quote
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
