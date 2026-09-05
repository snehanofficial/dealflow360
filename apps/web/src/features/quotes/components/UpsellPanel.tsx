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
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
              Upsell & Cross-Sell Recommendations
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Rule-Engine Driven
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Commercial impact evaluation and ranked co-purchase suggestions
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
          {activeRecommendations.length} Suggested
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {activeRecommendations.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-slate-800">
              No Additional Recommendations
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
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
                  className="group relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  {/* Top Row: Badges & Dismiss */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200/70 text-slate-700">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {rec.category}
                      </span>

                      {hasPromo && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300/60">
                          <Tag className="w-3 h-3 text-amber-600" />
                          {rec.promotionDiscountPercent}% Promo Bundle
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200">
                        Rank #{rec.priority}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDismiss(rec.ruleId)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Dismiss recommendation"
                      aria-label="Dismiss recommendation"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Info */}
                  <div className="mb-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 text-base">
                        {rec.productName}
                      </h3>
                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol}
                          {rec.marginImpact.additionalRevenue.toLocaleString()}
                        </span>
                        {hasPromo && (
                          <span className="block text-xs text-slate-400 line-through">
                            {currencySymbol}
                            {rec.listPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reason Metadata */}
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-600 bg-white/80 border border-slate-200/80 p-2 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-800 font-medium">Reason: </strong>
                        {rec.reason}
                      </span>
                    </div>
                  </div>

                  {/* Commercial Margin Delta Impact */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-100/70 p-2.5 rounded-lg mb-3 border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 block">Revenue Impact</span>
                      <span className="font-semibold text-emerald-700 font-mono">
                        +{currencySymbol}
                        {rec.marginImpact.additionalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Est. Cost</span>
                      <span className="font-medium text-slate-700 font-mono">
                        {currencySymbol}
                        {rec.marginImpact.additionalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-500 block">Margin Impact</span>
                      <span
                        className={`font-semibold font-mono flex items-center gap-0.5 ${
                          marginDelta >= 0 ? 'text-purple-700' : 'text-amber-700'
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
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      {rec.billingType === 'RECURRING' ? (
                        <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          <Clock className="w-3 h-3" />
                          Recurring ({rec.recurringPeriod})
                        </span>
                      ) : (
                        <span className="text-slate-600">One-time product</span>
                      )}
                      <span>· SKU: {rec.sku}</span>
                    </div>

                    <button
                      onClick={() => handleAdd(rec)}
                      disabled={isAdding}
                      className="inline-flex items-center gap-1.5 bg-[#714B67] hover:bg-[#5c3c54] text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50 min-h-[36px] cursor-pointer"
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
