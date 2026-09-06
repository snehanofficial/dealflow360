import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  CheckCircle,
  Truck,
  FileCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Building2,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.js';
import { useDashboard } from '../dashboard/useDashboard.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  DollarSign,
  CheckCircle,
  Truck,
  FileCheck,
};

export const CustomerPortalDashboardPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { data: dashboard, isLoading, isError, error, refetch } = useDashboard();

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-white border border-red-200 rounded-xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Customer Portal</h2>
        <p className="text-sm text-slate-600 mb-6">
          {error?.message || 'An error occurred while communicating with the server.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  const kpis = dashboard?.kpis || [];
  const alerts = dashboard?.alerts || [];
  const recentQuotations = dashboard?.recentQuotations || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-[#714B67] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium text-white/90 mb-3">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Customer Portal Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome, {dashboard?.user?.name || authUser?.name || 'Customer'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            Review active proposals, negotiation statuses, orders, and invoices in one secure workspace.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2 text-xs text-white/90">
          <span className="bg-white/15 px-3 py-1.5 rounded-lg font-medium">{currentDateFormatted}</span>
          <span className="text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Account Active & Governed
          </span>
        </div>
      </div>

      {/* Attention / Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-purple-50 border-purple-200 text-purple-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-[#714B67]" />
                <div>
                  <h4 className="font-bold text-sm">{alert.title}</h4>
                  <p className="text-xs mt-0.5 opacity-90">{alert.description}</p>
                </div>
              </div>
              <Link
                to={alert.actionUrl || '/quotations'}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white border shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 text-slate-800 border-slate-300"
              >
                {alert.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Executive Customer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = iconMap[kpi.icon] || FileText;

          return (
            <Link
              key={kpi.id}
              to={kpi.actionUrl || '/quotations'}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#714B67] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{kpi.formattedValue}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F3E9F1] flex items-center justify-center text-[#714B67]">
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-xs font-medium text-[#714B67] group-hover:underline">
                View details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Proposals & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#714B67]" /> Active Quotations & Proposals
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Commercial quotations issued for your review</p>
            </div>
            <Link to="/quotations" className="text-xs font-bold text-[#714B67] flex items-center hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentQuotations.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                    <th className="py-3 px-5">Quote Number</th>
                    <th className="py-3 px-5">Net Value</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Updated</th>
                    <th className="py-3 px-5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {recentQuotations.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => (window.location.href = `/quotations/${quote.id}`)}
                    >
                      <td className="py-3.5 px-5 font-sans font-bold text-[#714B67]">
                        {quote.quoteNumber}
                      </td>
                      <td className="py-3.5 px-5 text-slate-900 font-bold">
                        {quote.formattedValue}
                      </td>
                      <td className="py-3.5 px-5 font-sans">
                        <CustomerStatusBadge status={quote.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right text-slate-500 font-sans text-xs">
                        {new Date(quote.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active quotations found. Reach out to your sales representative to initiate a proposal.
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Destinations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Customer Workspace Navigation</h3>
            <p className="text-xs text-slate-500 mb-4">Direct shortcuts to your primary account records.</p>

            <div className="space-y-3">
              <Link
                to="/quotations"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#F3E9F1] hover:border-[#714B67] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#714B67]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#714B67]">Quotations</h4>
                    <p className="text-[11px] text-slate-500">Review, negotiate & track proposals</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#714B67]" />
              </Link>

              <Link
                to="/invoices"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#F3E9F1] hover:border-[#714B67] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#714B67]">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#714B67]">Invoices & Billing</h4>
                    <p className="text-[11px] text-slate-500">Access commercial invoices & payment terms</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#714B67]" />
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-900 block">Need assistance with a quote?</span>
            <p className="text-[11px] text-slate-500">
              Submit counteroffers directly on individual quotation detail pages or contact your dedicated account manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function CustomerStatusBadge({ status }: { status?: string }) {
  const normalized = status?.toUpperCase() || 'DRAFT';
  const getColors = () => {
    switch (normalized) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
      case 'PENDING_MANAGER':
      case 'PENDING_FINANCE':
      case 'UNDER REVIEW':
        return 'bg-amber-100 text-amber-800';
      case 'SUBMITTED':
      case 'NEGOTIATING':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case 'PENDING_MANAGER':
      case 'PENDING_FINANCE':
        return 'IN REVIEW';
      case 'NEGOTIATING':
        return 'COUNTEROFFER UNDER REVIEW';
      default:
        return normalized;
    }
  };

  return <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${getColors()}`}>{getLabel()}</span>;
}
