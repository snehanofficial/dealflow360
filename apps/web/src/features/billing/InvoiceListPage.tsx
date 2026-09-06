import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import { InvoiceDto, InvoiceStatus } from '@dealflow360/contracts';
import {
  FileText,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  FileCheck,
  ChevronRight,
  Loader2,
  DollarSign,
  Plus,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatusTab = searchParams.get('status') || 'ALL';

  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {};
      if (currentStatusTab !== 'ALL') {
        params.status = currentStatusTab;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get<{ success: boolean; data: InvoiceDto[] }>('/invoices', { params });
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(err.response?.data?.error?.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [currentStatusTab, searchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Aggregate KPI Metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.status !== 'VOID' ? inv.totalAmount : 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? inv.totalAmount : 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.status === 'ISSUED' ? inv.totalAmount : 0), 0);

  const handleTabChange = (status: string) => {
    if (status === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Issued
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
          </span>
        );
      case 'VOID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Ban className="w-3 h-3 text-slate-400" /> Void
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" /> Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#714B67]/10 text-[#714B67]">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices & Billing</h1>
              <p className="text-xs text-slate-500">
                Auditable financial snapshots of approved commercial transactions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/quotations')}
          className="inline-flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Invoice from Quote
        </button>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Invoiced</span>
            <DollarSign className="w-4 h-4 text-[#714B67]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Excludes voided invoices</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-mono">
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Settled payments</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Outstanding</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 font-mono">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending customer settlement</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Records</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 font-mono">{invoices.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active billing documents</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
            {['ALL', 'ISSUED', 'PAID', 'DRAFT', 'VOID'].map((tab) => {
              const isActive = currentStatusTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                >
                  {tab === 'ALL' ? 'All Invoices' : tab}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
            />
          </div>
        </div>

        {/* Invoice Table / Empty / Loading State */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto mb-2" />
            <p className="text-xs font-medium">Loading invoices...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Invoices Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Invoices are automatically generated from approved quotations. Navigate to Quotations to create an invoice.
            </p>
            <button
              onClick={() => navigate('/quotations')}
              className="inline-flex items-center gap-1.5 text-xs text-[#714B67] hover:underline font-semibold"
            >
              View Approved Quotations &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#714B67]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {inv.customerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${inv.id}`);
                        }}
                        className="inline-flex items-center text-slate-500 hover:text-slate-900 font-semibold text-xs"
                      >
                        Details <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
