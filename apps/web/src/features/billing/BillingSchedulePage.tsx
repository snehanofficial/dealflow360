import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api/client.js';
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  Search,
  Filter,
  Eye,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface BillingLineItem {
  id?: string;
  quoteLineId: string | null;
  productName: string;
  billingType: 'ONE_TIME' | 'RECURRING';
  recurringPeriod: 'MONTHLY' | 'ANNUAL' | null;
  billingDate: string;
  amount: number;
  proratedDays: number | null;
  isProrated: boolean;
  status: string;
}

interface ComputedSchedule {
  totalOneTimeAmount: number;
  totalRecurringMonthly: number;
  totalRecurringAnnual: number;
  billingStartDate: string;
  lines: BillingLineItem[];
}

interface PersistedSchedule {
  id: string;
  totalOneTimeAmount: number;
  totalRecurringMonthly: number;
  totalRecurringAnnual: number;
  billingStartDate: string;
  status: string;
  lines: BillingLineItem[];
}

interface SingleBillingResponseData {
  quotation: {
    id: string;
    quoteNumber: string;
    status: string;
    customer?: { name: string; tier: string };
  };
  persistedSchedule: PersistedSchedule | null;
  computedSchedule: ComputedSchedule;
}

interface UniversalScheduleItem {
  quotationId: string;
  quoteNumber: string;
  quoteStatus: string;
  netValue: number;
  currency: string;
  updatedAt: string;
  customer?: { id: string; name: string; tier: string } | null;
  schedule: {
    totalOneTimeAmount: number;
    totalRecurringMonthly: number;
    totalRecurringAnnual: number;
    isLocked: boolean;
    status: string;
    billingStartDate: string;
    lineCount: number;
  };
}

interface UniversalBillingResponseData {
  summary: {
    totalDeals: number;
    activeSchedulesCount: number;
    totalOneTimeAmount: number;
    totalRecurringMonthly: number;
    totalRecurringAnnual: number;
  };
  items: UniversalScheduleItem[];
}

export const BillingSchedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mode: Single Quote View vs. Universal List View
  const isSingleQuoteView = Boolean(id);

  // Single Quote State
  const [singleData, setSingleData] = useState<SingleBillingResponseData | null>(null);
  const [isLoadingSingle, setIsLoadingSingle] = useState<boolean>(isSingleQuoteView);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [errorSingle, setErrorSingle] = useState<string | null>(null);
  const [successMsgSingle, setSuccessMsgSingle] = useState<string | null>(null);
  const [billingStartDate, setBillingStartDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [lineFilterType, setLineFilterType] = useState<'ALL' | 'ONE_TIME' | 'RECURRING'>('ALL');

  // Universal Hub State
  const [universalData, setUniversalData] = useState<UniversalBillingResponseData | null>(null);
  const [isLoadingUniversal, setIsLoadingUniversal] = useState<boolean>(!isSingleQuoteView);
  const [errorUniversal, setErrorUniversal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fetch Single Quote Schedule
  const fetchSingleSchedule = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingSingle(true);
      setErrorSingle(null);
      const res = await api.get<{ success: boolean; data: SingleBillingResponseData }>(
        `/quotes/${id}/billing`,
        { params: { startDate: billingStartDate } },
      );

      if (res.data.success) {
        setSingleData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load single billing schedule:', err);
      setErrorSingle(err.response?.data?.message || 'Failed to load billing schedule for quote');
    } finally {
      setIsLoadingSingle(false);
    }
  }, [id, billingStartDate]);

  // Fetch Universal Billing Schedules
  const fetchUniversalSchedules = useCallback(async () => {
    if (isSingleQuoteView) return;
    try {
      setIsLoadingUniversal(true);
      setErrorUniversal(null);
      const res = await api.get<{ success: boolean; data: UniversalBillingResponseData }>(
        '/billing',
        {
          params: {
            search: searchQuery || undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
          },
        },
      );

      if (res.data.success) {
        setUniversalData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load universal billing schedules:', err);
      setErrorUniversal(err.response?.data?.message || 'Failed to load billing schedules');
    } finally {
      setIsLoadingUniversal(false);
    }
  }, [isSingleQuoteView, searchQuery, statusFilter]);

  useEffect(() => {
    if (isSingleQuoteView) {
      fetchSingleSchedule();
    } else {
      fetchUniversalSchedules();
    }
  }, [isSingleQuoteView, fetchSingleSchedule, fetchUniversalSchedules]);

  // Handle Lock Schedule for Single Quote
  const handleConfirmAndLock = async () => {
    if (!id) return;
    try {
      setIsLocking(true);
      setErrorSingle(null);
      setSuccessMsgSingle(null);

      const res = await api.post<{ success: boolean; message: string }>(
        `/quotes/${id}/billing/generate`,
        { billingStartDate },
      );

      if (res.data.success) {
        setSuccessMsgSingle(res.data.message || 'Billing schedule locked successfully');
        await fetchSingleSchedule();
      }
    } catch (err: any) {
      console.error('Failed to lock billing schedule:', err);
      setErrorSingle(err.response?.data?.message || 'Failed to lock billing schedule');
    } finally {
      setIsLocking(false);
    }
  };

  // Handle Complete Billing for Single Quote
  const handleCompleteBilling = async () => {
    if (!id) return;
    try {
      setIsLocking(true);
      setErrorSingle(null);
      setSuccessMsgSingle(null);

      const res = await api.post<{ success: boolean; message: string }>(
        `/quotes/${id}/billing/complete`,
      );

      if (res.data.success) {
        setSuccessMsgSingle(res.data.message || 'Billing completed & deal marked COMPLETED!');
        await fetchSingleSchedule();
      }
    } catch (err: any) {
      console.error('Failed to complete billing:', err);
      setErrorSingle(err.response?.data?.message || 'Failed to complete billing');
    } finally {
      setIsLocking(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Single Quotation Detailed Billing View (/quotations/:id/billing)
  // -------------------------------------------------------------
  if (isSingleQuoteView) {
    if (isLoadingSingle && !singleData) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
            <p className="text-sm font-medium text-slate-600">Generating Hybrid Billing Schedule...</p>
          </div>
        </div>
      );
    }

    if (errorSingle || !singleData) {
      return (
        <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
            <h3 className="font-semibold text-lg">Billing Schedule Unavailable</h3>
            <p className="text-sm">{errorSingle || 'Unable to load billing schedule details.'}</p>
          </div>
          <button
            onClick={() => navigate('/billing')}
            className="inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to All Billing Schedules
          </button>
        </div>
      );
    }

    const { quotation, persistedSchedule, computedSchedule } = singleData;
    const activeSchedule = persistedSchedule || computedSchedule;
    const isLocked = Boolean(persistedSchedule);

    const displayedLines = activeSchedule.lines.filter((line) => {
      if (lineFilterType === 'ONE_TIME') return line.billingType === 'ONE_TIME';
      if (lineFilterType === 'RECURRING') return line.billingType === 'RECURRING';
      return true;
    });

    const totalContractValue =
      activeSchedule.totalOneTimeAmount +
      activeSchedule.totalRecurringMonthly * 12 +
      activeSchedule.totalRecurringAnnual;

    return (
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/billing')}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Back to all billing schedules"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">All Schedules</span>
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-[#714B67]" />
                  Subscription & Hybrid Billing Schedule
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                    isLocked
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {isLocked ? 'SCHEDULE LOCKED' : quotation.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <Link to={`/quotations/${quotation.id}`} className="hover:underline font-semibold text-[#714B67]">
                  Quote #{quotation.quoteNumber}
                </Link>
                {' • '}
                {quotation.customer?.name || 'Enterprise Customer'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Start Date:</span>
              <input
                type="date"
                value={billingStartDate}
                disabled={isLocked}
                onChange={(e) => setBillingStartDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none disabled:opacity-60"
              />
            </div>

            {!isLocked && (
              <button
                onClick={handleConfirmAndLock}
                disabled={isLocking}
                className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5b3c53] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-xs transition-colors"
              >
                {isLocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Confirm & Lock Billing Schedule
              </button>
            )}

            {quotation.status !== 'COMPLETED' && (
              <button
                onClick={handleCompleteBilling}
                disabled={isLocking}
                className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5c3d54] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-xs transition-colors"
              >
                {isLocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Complete Billing & Mark COMPLETED
              </button>
            )}
          </div>
        </div>

        {successMsgSingle && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsgSingle}
          </div>
        )}

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-600" /> One-Time Charges (Upfront)
            </span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              ${activeSchedule.totalOneTimeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400">Billed 100% on start date</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Recurring Monthly
            </span>
            <p className="text-2xl font-bold text-blue-700 font-mono">
              ${activeSchedule.totalRecurringMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs text-slate-500 font-normal"> /mo</span>
            </p>
            <p className="text-[11px] text-slate-400">Monthly recurring subscriptions</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> Recurring Annual
            </span>
            <p className="text-2xl font-bold text-purple-700 font-mono">
              ${activeSchedule.totalRecurringAnnual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs text-slate-500 font-normal"> /yr</span>
            </p>
            <p className="text-[11px] text-slate-400">Annual recurring subscriptions</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> 12-Month Total Value
            </span>
            <p className="text-2xl font-bold text-emerald-700 font-mono">
              ${totalContractValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400">Projected 1-year contract total</p>
          </div>
        </div>

        {/* Commercial Policy Proration Banner */}
        <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-4 h-4 text-[#714B67] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Commercial Governance Note on Proration:</span>
            <p className="mt-0.5 text-slate-600">
              One-time product lines (hardware, initial services) are separated from subscription recurring lines.
              If a subscription begins mid-cycle, initial period charges are prorated server-side based on exact active days:
              <code className="ml-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
                Prorated = Recurring Amount × (Active Days / Period Days)
              </code>
            </p>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLineFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  lineFilterType === 'ALL'
                    ? 'bg-[#714B67] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Schedule Items ({activeSchedule.lines.length})
              </button>

              <button
                onClick={() => setLineFilterType('ONE_TIME')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  lineFilterType === 'ONE_TIME'
                    ? 'bg-[#714B67] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                One-Time Charges
              </button>

              <button
                onClick={() => setLineFilterType('RECURRING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  lineFilterType === 'RECURRING'
                    ? 'bg-[#714B67] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Recurring Subscriptions
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {displayedLines.length} item(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">Line Product</th>
                  <th className="py-3 px-3">Billing Type</th>
                  <th className="py-3 px-4">Scheduled Billing Date</th>
                  <th className="py-3 px-4 text-right">Amount ($)</th>
                  <th className="py-3 px-4 text-center">Proration Details</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {displayedLines.map((line, idx) => {
                  const bDate = new Date(line.billingDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={line.id || `line-${idx}`} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        {line.productName}
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        {line.billingType === 'ONE_TIME' ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                            ONE-TIME
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                            {line.recurringPeriod} RECURRING
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-sans">{bDate}</td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${line.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        {line.isProrated ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> Prorated ({line.proratedDays} days)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Full Period</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Universal Billing Schedule Hub (/billing)
  // -------------------------------------------------------------
  const summary = universalData?.summary || {
    totalDeals: 0,
    activeSchedulesCount: 0,
    totalOneTimeAmount: 0,
    totalRecurringMonthly: 0,
    totalRecurringAnnual: 0,
  };
  const items = universalData?.items || [];

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-[#714B67]" />
            Universal Billing Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Revenue operations & hybrid billing schedule oversight across all commercial deals.
          </p>
        </div>

        <button
          onClick={fetchUniversalSchedules}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUniversal ? 'animate-spin' : ''}`} />
          Refresh Schedules
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#714B67]" /> Total Deals & Active Schedules
          </span>
          <div className="flex items-baseline justify-between pt-1">
            <p className="text-2xl font-bold text-slate-900 font-mono">{summary.totalDeals}</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {summary.activeSchedulesCount} Locked
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Deals in billing lifecycle</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-slate-600" /> One-Time Charges Total
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono pt-1">
            ${summary.totalOneTimeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400">Upfront hardware & service billing</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-blue-600" /> Monthly Recurring (MRR)
          </span>
          <p className="text-2xl font-bold text-blue-700 font-mono pt-1">
            ${summary.totalRecurringMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span className="text-xs text-slate-500 font-normal"> /mo</span>
          </p>
          <p className="text-[11px] text-slate-400">Combined monthly subscriptions</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-600" /> Annual Recurring (ARR)
          </span>
          <p className="text-2xl font-bold text-purple-700 font-mono pt-1">
            ${summary.totalRecurringAnnual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span className="text-xs text-slate-500 font-normal"> /yr</span>
          </p>
          <p className="text-[11px] text-slate-400">Combined annual subscriptions</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Quote # or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 font-medium mr-1 flex-shrink-0">Status:</span>
          {['ALL', 'BILLING', 'FULFILLMENT', 'APPROVED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-[#714B67] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {errorUniversal && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {errorUniversal}
        </div>
      )}

      {/* Universal Schedule Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoadingUniversal ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#714B67] mx-auto" />
            <p className="text-xs font-medium text-slate-500">Loading Universal Billing Schedules...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-sm">No Billing Schedules Found</h3>
            <p className="text-xs text-slate-500">
              No quotations match your current search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="py-3.5 px-4">Quotation</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-3 text-center">Quote Status</th>
                  <th className="py-3.5 px-3 text-center">Lock Status</th>
                  <th className="py-3.5 px-4 text-right">One-Time Total ($)</th>
                  <th className="py-3.5 px-4 text-right">Monthly MRR ($)</th>
                  <th className="py-3.5 px-4 text-right">Annual ARR ($)</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {items.map((item) => (
                  <tr key={item.quotationId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      <Link
                        to={`/quotations/${item.quotationId}/billing`}
                        className="text-[#714B67] hover:underline flex items-center gap-1.5"
                      >
                        {item.quoteNumber}
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{item.customer?.name || 'N/A'}</div>
                      {item.customer?.tier && (
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {item.customer.tier} Tier
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          item.quoteStatus === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.quoteStatus === 'BILLING'
                            ? 'bg-purple-100 text-purple-800'
                            : item.quoteStatus === 'FULFILLMENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.quoteStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-sans">
                      {item.schedule.isLocked ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-600" /> Locked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Draft
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      ${item.schedule.totalOneTimeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-blue-700">
                      ${item.schedule.totalRecurringMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-purple-700">
                      ${item.schedule.totalRecurringAnnual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      <button
                        onClick={() => navigate(`/quotations/${item.quotationId}/billing`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Schedule
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
