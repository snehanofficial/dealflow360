import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import {
  LayoutDashboard,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  RefreshCw,
  Package,
  Layers,
} from 'lucide-react';

interface ControlTowerMetrics {
  totalPipelineValue: number;
  activeQuoteCount: number;
  stalledDealsCount: number;
  marginLeakageCount: number;
  fulfillmentRiskCount: number;
  highRiskDealsCount: number;
  averageGrossMarginPercent: number;
}

interface DealAlertItem {
  id: string;
  quotationId: string;
  alertType: 'STALLED_DEAL' | 'MARGIN_LEAKAGE' | 'FULFILLMENT_RISK' | 'HIGH_RISK';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  isResolved: boolean;
  createdAt: string;
  quotation?: {
    quoteNumber: string;
    customer?: { name: string };
  };
}

interface QuotationItem {
  id: string;
  quoteNumber: string;
  status: string;
  netValue: number;
  grossMarginPercent: number;
  riskScore: number;
  riskLevel: string;
  updatedAt: string;
  customer?: { name: string; tier: string };
}

interface ControlTowerData {
  metrics: ControlTowerMetrics;
  alerts: DealAlertItem[];
  quotations: QuotationItem[];
}

export const ControlTowerPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<ControlTowerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: ControlTowerData }>(
        '/control-tower',
        {
          params: {
            status: statusFilter,
            riskLevel: riskFilter,
            search: searchTerm || undefined,
          },
        },
      );

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load Control Tower dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load Control Tower dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, riskFilter, searchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      setResolvingId(alertId);
      await api.post(`/control-tower/alerts/${alertId}/resolve`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setResolvingId(null);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Control Tower Dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalPipelineValue: 0,
    activeQuoteCount: 0,
    stalledDealsCount: 0,
    marginLeakageCount: 0,
    fulfillmentRiskCount: 0,
    highRiskDealsCount: 0,
    averageGrossMarginPercent: 0,
  };

  const alerts = data?.alerts || [];
  const quotations = data?.quotations || [];

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-[#714B67]" />
              Deal Control Tower & Operations Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time commercial deal health governance, margin leakage protection, and stalled deal alerts
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 p-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Dashboard
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Pipeline Value
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${metrics.totalPipelineValue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-slate-400">{metrics.activeQuoteCount} active deal(s)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Stalled Deals (&gt;7 days)
          </span>
          <p className="text-2xl font-bold text-amber-700 font-mono">
            {metrics.stalledDealsCount}
          </p>
          <p className="text-[11px] text-slate-400">Requires follow-up</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> Margin Leakage
          </span>
          <p className="text-2xl font-bold text-rose-700 font-mono">
            {metrics.marginLeakageCount}
          </p>
          <p className="text-[11px] text-slate-400">Below 25% threshold</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-blue-600" /> Fulfillment Risks
          </span>
          <p className="text-2xl font-bold text-blue-700 font-mono">
            {metrics.fulfillmentRiskCount}
          </p>
          <p className="text-[11px] text-slate-400">Backorders unfulfilled</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" /> High-Risk Deals
          </span>
          <p className="text-2xl font-bold text-purple-700 font-mono">
            {metrics.highRiskDealsCount}
          </p>
          <p className="text-[11px] text-slate-400">Risk Score &ge; 6.0</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-600" /> Avg Gross Margin
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {metrics.averageGrossMarginPercent}%
          </p>
          <p className="text-[11px] text-slate-400">Across active pipeline</p>
        </div>
      </div>

      {/* Active Deal Health Alerts Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Active Deal Health & Operational Alerts
          </h2>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
            {alerts.length} Active Alert(s)
          </span>
        </div>

        <div className="p-4">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> All commercial deals are healthy and operating within governed thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        alert.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-current">
                          {alert.alertType.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {alert.quotation?.customer?.name || 'Customer'} (Quote #{alert.quotation?.quoteNumber || alert.quotationId})
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700 font-medium">{alert.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/quotations/${alert.quotationId}`)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 text-[11px] inline-flex items-center gap-1"
                    >
                      View Deal <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-[11px] disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      {resolvingId === alert.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Dismiss Alert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filterable Deal Pipeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Controls Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" /> Active Commercial Deals Directory
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search quote or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-48 focus:outline-none focus:border-[#714B67]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_MANAGER">PENDING MANAGER</option>
              <option value="PENDING_FINANCE">PENDING FINANCE</option>
              <option value="APPROVED">APPROVED</option>
              <option value="NEGOTIATING">NEGOTIATING</option>
              <option value="FULFILLMENT">FULFILLMENT</option>
              <option value="BILLING">BILLING</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW RISK</option>
              <option value="MEDIUM">MEDIUM RISK</option>
              <option value="HIGH">HIGH RISK</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <th className="py-3 px-4">Quote Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Net Value ($)</th>
                <th className="py-3 px-4 text-center">Gross Margin %</th>
                <th className="py-3 px-4 text-center">Risk Evaluation</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No commercial deals matching selected filters.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => {
                  const isHighRisk = quote.riskLevel === 'HIGH';
                  const isLowMargin = quote.grossMarginPercent < 25.0;

                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {quote.quoteNumber}
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900">
                          {quote.customer?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Tier: {quote.customer?.tier || 'STANDARD'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {quote.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${quote.netValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <span
                          className={`font-semibold font-mono ${
                            isLowMargin ? 'text-rose-700 font-bold' : 'text-emerald-700'
                          }`}
                        >
                          {quote.grossMarginPercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {quote.riskLevel} ({quote.riskScore})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={() => navigate(`/quotations/${quote.id}`)}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
