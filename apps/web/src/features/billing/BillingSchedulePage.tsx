import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface BillingResponseData {
  quotation: {
    id: string;
    quoteNumber: string;
    status: string;
    customer?: { name: string; tier: string };
  };
  persistedSchedule: PersistedSchedule | null;
  computedSchedule: ComputedSchedule;
}

export const BillingSchedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<BillingResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [billingStartDate, setBillingStartDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [filterType, setFilterType] = useState<'ALL' | 'ONE_TIME' | 'RECURRING'>('ALL');

  const quoteId = id || 'quote-sample-001';

  const fetchBillingSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: BillingResponseData }>(
        `/quotes/${quoteId}/billing`,
        { params: { startDate: billingStartDate } },
      );

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load billing schedule:', err);
      setError(err.response?.data?.message || 'Failed to load billing schedule');
    } finally {
      setIsLoading(false);
    }
  }, [quoteId, billingStartDate]);

  useEffect(() => {
    fetchBillingSchedule();
  }, [fetchBillingSchedule]);

  const handleConfirmAndLock = async () => {
    try {
      setIsLocking(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post<{ success: boolean; message: string }>(
        `/quotes/${quoteId}/billing/generate`,
        { billingStartDate },
      );

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Billing schedule locked successfully');
        await fetchBillingSchedule();
      }
    } catch (err: any) {
      console.error('Failed to lock billing schedule:', err);
      setError(err.response?.data?.message || 'Failed to lock billing schedule');
    } finally {
      setIsLocking(false);
    }
  };

  const handleCompleteBilling = async () => {
    try {
      setIsLocking(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post<{ success: boolean; message: string }>(
        `/quotes/${quoteId}/billing/complete`,
      );

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Billing completed & deal marked COMPLETED!');
        await fetchBillingSchedule();
      }
    } catch (err: any) {
      console.error('Failed to complete billing:', err);
      setError(err.response?.data?.message || 'Failed to complete billing');
    } finally {
      setIsLocking(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
          <p className="text-sm font-medium text-slate-600">Generating Hybrid Billing Schedule...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="font-semibold text-lg">Billing Schedule Unavailable</h3>
          <p className="text-sm">{error || 'Unable to load billing schedule details.'}</p>
        </div>
        <button
          onClick={() => navigate('/quotations')}
          className="inline-flex items-center gap-2 text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Quotation List
        </button>
      </div>
    );
  }

  const { quotation, persistedSchedule, computedSchedule } = data;
  const activeSchedule = persistedSchedule || computedSchedule;

  const isLocked = Boolean(persistedSchedule);

  const displayedLines = activeSchedule.lines.filter((line) => {
    if (filterType === 'ONE_TIME') return line.billingType === 'ONE_TIME';
    if (filterType === 'RECURRING') return line.billingType === 'RECURRING';
    return true;
  });

  const totalContractValue =
    activeSchedule.totalOneTimeAmount +
    activeSchedule.totalRecurringMonthly * 12 +
    activeSchedule.totalRecurringAnnual;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/quotations/${quotation.id}`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
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
              Quote #{quotation.quoteNumber} • {quotation.customer?.name || 'Enterprise Customer'}
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

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
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
        {/* Table Filter Tabs */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Schedule Items ({activeSchedule.lines.length})
            </button>

            <button
              onClick={() => setFilterType('ONE_TIME')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'ONE_TIME'
                  ? 'bg-[#714B67] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              One-Time Charges
            </button>

            <button
              onClick={() => setFilterType('RECURRING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'RECURRING'
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
};
