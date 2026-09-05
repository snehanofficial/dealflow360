import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import {
  FileText,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Building2,
  TrendingUp,
  Loader2,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { KanbanBoard, KanbanColumn } from '../../components/kanban/index.js';
import { QuotationKanbanCard, QuotationKanbanItem } from './components/QuotationKanbanCard.js';

export const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuotationKanbanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (riskFilter) params.append('riskLevel', riskFilter);

      const res = await api.get<{ success: boolean; data: QuotationKanbanItem[] }>(
        `/quotes?${params.toString()}`,
      );

      if (res.data.success) {
        setQuotes(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch quotations:', err);
      setError(err.response?.data?.message || 'Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, riskFilter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Group quotations into Kanban Columns
  const kanbanColumns = useMemo<KanbanColumn<QuotationKanbanItem>[]>(() => {
    const draftItems = quotes.filter((q) => q.status === 'DRAFT');
    const pendingItems = quotes.filter(
      (q) => q.status === 'PENDING_MANAGER' || q.status === 'PENDING_FINANCE',
    );
    const approvedItems = quotes.filter((q) => q.status === 'APPROVED');
    const negotiatingItems = quotes.filter((q) => q.status === 'NEGOTIATING');
    const fulfillmentItems = quotes.filter(
      (q) => q.status === 'FULFILLMENT' || q.status === 'CONFIRMED',
    );
    const completedItems = quotes.filter(
      (q) => q.status === 'COMPLETED' || q.status === 'BILLING',
    );

    return [
      {
        id: 'DRAFT',
        title: 'Draft',
        items: draftItems,
        badgeVariant: 'slate',
        accentColor: 'border-slate-400',
        emptyText: 'No draft quotations',
      },
      {
        id: 'PENDING_APPROVAL',
        title: 'Pending Approval',
        items: pendingItems,
        badgeVariant: 'amber',
        accentColor: 'border-amber-500',
        emptyText: 'No quotes awaiting approval',
      },
      {
        id: 'APPROVED',
        title: 'Approved',
        items: approvedItems,
        badgeVariant: 'emerald',
        accentColor: 'border-emerald-500',
        emptyText: 'No approved quotes',
      },
      {
        id: 'NEGOTIATING',
        title: 'Under Negotiation',
        items: negotiatingItems,
        badgeVariant: 'purple',
        accentColor: 'border-purple-500',
        emptyText: 'No active negotiations',
      },
      {
        id: 'FULFILLMENT',
        title: 'Fulfillment',
        items: fulfillmentItems,
        badgeVariant: 'blue',
        accentColor: 'border-blue-500',
        emptyText: 'No quotes in fulfillment',
      },
      {
        id: 'COMPLETED',
        title: 'Completed / Billing',
        items: completedItems,
        badgeVariant: 'emerald',
        accentColor: 'border-emerald-600',
        emptyText: 'No completed quotes',
      },
    ];
  }, [quotes]);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#714B67]" />
            Commercial Quotations & Deal Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage governed sales quotes, policy evaluations, risk scoring, and deal pipeline progression
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-[#714B67] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-[#714B67] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table View
            </button>
          </div>

          <button
            onClick={() => navigate('/quotations/new')}
            className="inline-flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Quotation
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by quote number, customer name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#714B67]"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING_MANAGER">PENDING_MANAGER</option>
              <option value="PENDING_FINANCE">PENDING_FINANCE</option>
              <option value="APPROVED">APPROVED</option>
              <option value="NEGOTIATING">NEGOTIATING</option>
              <option value="FULFILLMENT">FULFILLMENT</option>
              <option value="BILLING">BILLING</option>
            </select>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#714B67]"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">LOW RISK</option>
            <option value="MEDIUM">MEDIUM RISK</option>
            <option value="HIGH">HIGH RISK</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'KANBAN' ? (
        <KanbanBoard<QuotationKanbanItem>
          columns={kanbanColumns}
          isLoading={isLoading}
          error={error}
          onRetry={fetchQuotes}
          keyExtractor={(quote) => quote.id}
          onCardClick={(quote) => navigate(`/quotations/${quote.id}`)}
          renderCard={(quote) => (
            <QuotationKanbanCard
              quote={quote}
              onView={(quoteId) => navigate(`/quotations/${quoteId}`)}
            />
          )}
        />
      ) : isLoading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading quotations...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-700 space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-rose-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">No Quotations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first sales quote with pricing, margin, and risk evaluation.
          </p>
          <button
            onClick={() => navigate('/quotations/new')}
            className="inline-flex items-center gap-2 bg-[#714B67] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#5b3c53]"
          >
            <Plus className="w-3.5 h-3.5" /> Create New Quote
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Net Value</th>
                  <th className="py-3.5 px-3 text-right">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center">Risk Assessment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {quotes.map((q) => {
                  const isHigh = q.riskLevel === 'HIGH';
                  const isMedium = q.riskLevel === 'MEDIUM';

                  return (
                    <tr
                      key={q.id}
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {q.quoteNumber}
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {q.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{q.customer.code} • {q.customer.tier}</div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                            q.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : q.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : q.status.startsWith('PENDING')
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                        ${q.netValue.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-purple-700 font-mono">
                        <div className="flex items-center justify-end gap-1 font-sans">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          {q.grossMarginPercent}%
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isMedium
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isHigh ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {q.riskLevel} ({q.riskScore})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quotations/${q.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-[#714B67] hover:text-[#5b3c53] font-semibold text-xs"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
