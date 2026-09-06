import React from 'react';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export interface QuotationKanbanItem {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  totalDiscount: number;
  netValue: number;
  grossMarginPercent: number;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    code: string;
    tier: string;
  };
}

export interface QuotationKanbanCardProps {
  quote: QuotationKanbanItem;
  onView?: (quoteId: string) => void;
}

export const QuotationKanbanCard: React.FC<QuotationKanbanCardProps> = ({ quote, onView }) => {
  const isHighRisk = quote.riskLevel === 'HIGH' || quote.riskLevel === 'CRITICAL';
  const isMediumRisk = quote.riskLevel === 'MEDIUM';
  const isLowMargin = quote.grossMarginPercent < 25.0;

  const formattedDate = new Date(quote.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white border border-slate-200 hover:border-[#714B67]/50 hover:shadow-md rounded-xl p-3.5 space-y-3 transition-all duration-150 group">
      {/* Header: Quote Number & Risk Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-[#714B67] transition-colors">
          {quote.quoteNumber}
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${
            isHighRisk
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : isMediumRisk
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {isHighRisk ? (
            <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
          ) : isMediumRisk ? (
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
          )}
          {quote.riskLevel} ({quote.riskScore?.toFixed(1)})
        </span>
      </div>

      {/* Customer Info */}
      <div className="space-y-0.5">
        <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{quote.customer.name}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium pl-5">
          {quote.customer.code} • <span className="uppercase text-slate-500">{quote.customer.tier}</span>
        </div>
      </div>

      {/* Value & Margin Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Value</span>
          <span className="font-mono font-bold text-slate-900">${quote.netValue.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Margin</span>
          <div className="flex items-center gap-1 font-mono font-bold">
            <TrendingUp
              className={`w-3 h-3 ${isLowMargin ? 'text-rose-600' : 'text-purple-600'}`}
            />
            <span className={isLowMargin ? 'text-rose-700' : 'text-purple-700'}>
              {quote.grossMarginPercent?.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Date & Direct Action */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1 font-medium">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(quote.id);
          }}
          className="inline-flex items-center gap-0.5 text-[#714B67] hover:text-[#5b3c53] font-bold text-xs transition-colors"
        >
          View <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
