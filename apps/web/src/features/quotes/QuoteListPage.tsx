import React, { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';

interface QuotationListItem {
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

export const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuotationListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (riskFilter) params.append('riskLevel', riskFilter);

      const res = await api.get<{ success: boolean; data: QuotationListItem[] }>(
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#714B67]" />
            Commercial Quotations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage governed sales quotes, policy evaluations, and risk scoring
          </p>
        </div>

        <button
          onClick={() => navigate('/quotations/new')}
          className="inline-flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Quotation
        </button>
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
      {isLoading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-xs text-slate-500">Loading quotations...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-700 space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-rose-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200">
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
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
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${q.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : q.status.startsWith('PENDING')
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        ${q.netValue.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-purple-700">
                        <div className="flex items-center justify-end gap-1 font-sans">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          {q.grossMarginPercent}%
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${isHigh
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
