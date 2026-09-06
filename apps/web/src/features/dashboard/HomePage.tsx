import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, FileText, DollarSign, ShieldAlert,
  CheckCircle, Truck, MoreHorizontal, ArrowRight, Lightbulb, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.js';
import { useDashboard } from './useDashboard.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { DashboardKpiDto } from '@dealflow360/contracts';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  DollarSign,
  ShieldAlert,
  CheckCircle,
  Truck,
};

export const HomePage: React.FC = () => {
  const { user: authUser, role } = useAuth();

  if (role === 'CUSTOMER' || authUser?.role === 'CUSTOMER') {
    return <Navigate to="/portal" replace />;
  }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl lg:col-span-2"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-white border border-red-200 rounded-xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Dashboard Data</h2>
        <p className="text-sm text-slate-600 mb-6">
          {error?.message || 'An error occurred while communicating with the commercial governance engine.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  const kpis = dashboard?.kpis || [];
  const alerts = dashboard?.alerts || [];
  const pipelineData = dashboard?.pipeline || [];
  const recentQuotations = dashboard?.recentQuotations || [];
  const pendingApprovals = dashboard?.pendingApprovals || [];

  // Risk distribution aggregate from recent quotations
  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  recentQuotations.forEach((q) => {
    const level = (q.riskLevel?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW';
    if (riskCounts[level] !== undefined) {
      riskCounts[level]++;
    }
  });

  const totalQuotationsCount = recentQuotations.length;
  const riskData = [
    { name: 'Low', value: totalQuotationsCount ? Math.round((riskCounts.LOW / totalQuotationsCount) * 100) : 0, color: '#22C55E' },
    { name: 'Medium', value: totalQuotationsCount ? Math.round((riskCounts.MEDIUM / totalQuotationsCount) * 100) : 0, color: '#F59E0B' },
    { name: 'High', value: totalQuotationsCount ? Math.round((riskCounts.HIGH / totalQuotationsCount) * 100) : 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Hello, {dashboard?.user?.name || authUser?.name?.split(' ')[0] || 'User'}!{' '}
            <span className="text-xl sm:text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {dashboard?.role ? `${dashboard.role.replace('_', ' ')} Workspace` : "Here's what's happening with your deals today."}
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-600 bg-white px-3 sm:px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <span>{currentDateFormatted}</span>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-4">
              <span className="text-yellow-500">☀️</span>
              <span>Commercial System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/quotations/new"
              className="px-4 py-2 text-sm font-medium text-white bg-[#714B67] hover:bg-[#5F3D56] rounded-md transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="text-lg leading-none">+</span> New Quotation
            </Link>
          </div>
        </div>
      </div>

      {/* Attention / Alerts Banner Section */}
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
                <ShieldAlert
                  className={`w-5 h-5 mt-0.5 shrink-0 ${
                    alert.severity === 'CRITICAL'
                      ? 'text-red-600'
                      : alert.severity === 'HIGH'
                      ? 'text-amber-600'
                      : 'text-purple-600'
                  }`}
                />
                <div>
                  <h4 className="font-bold text-sm">{alert.title}</h4>
                  <p className="text-xs mt-0.5 opacity-90">{alert.description}</p>
                </div>
              </div>
              <a
                href={alert.actionUrl}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white border shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 text-slate-800 border-slate-300"
              >
                {alert.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = iconMap[kpi.icon] || FileText;

          return (
            <div
              key={kpi.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer"
              onClick={() => kpi.actionUrl && (window.location.href = kpi.actionUrl)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{kpi.formattedValue}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
              {kpi.actionUrl && (
                <div className="flex items-center mt-4 text-xs font-medium text-indigo-600 hover:underline">
                  View details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Pipeline Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-slate-900">Commercial Pipeline Stage Breakdown</h3>
                <p className="text-xs text-slate-500 mt-1">Quotations grouped by commercial governance status</p>
              </div>
            </div>

            {pipelineData.length > 0 ? (
              <>
                <div className="flex space-x-1 mb-4 h-9">
                  {pipelineData.map((stage) => (
                    <div key={stage.name} className="flex-1 flex items-center justify-center relative group rounded-sm overflow-hidden">
                      <div className="absolute inset-0" style={{ backgroundColor: stage.color }}></div>
                      <span className="relative z-10 text-[10px] font-semibold text-slate-800 truncate px-1">
                        {stage.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-center mt-2 px-1">
                  {pipelineData.map((stage) => (
                    <div key={`val-${stage.name}`} className="flex-1">
                      <div className="font-bold text-lg text-slate-900">{stage.count}</div>
                      <div className="text-[11px] text-slate-500 font-medium">${stage.value}K</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-slate-400 text-sm">No commercial pipeline stage data available.</div>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900">Risk Level Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Quotations categorized by blended commercial risk score</p>
          </div>
          <div className="flex items-center h-48">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">{totalQuotationsCount}</span>
                <span className="text-[10px] text-slate-500 mt-1">Total</span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-4 pl-4">
              {riskData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-slate-700">{item.name} Risk</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations / Work Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">Recent Quotations & Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Authoritative status of your latest commercial records</p>
            </div>
            <Link to="/quotations" className="text-sm font-semibold text-indigo-600 flex items-center hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            {recentQuotations.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Quote / Order #</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Customer</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Net Value</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Risk</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Status</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentQuotations.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => (window.location.href = `/quotations/${quote.id}`)}
                    >
                      <td className="py-3.5 px-5 text-sm font-medium text-indigo-600">{quote.quoteNumber}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-700">{quote.customerName}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-700 font-medium">{quote.formattedValue}</td>
                      <td className="py-3.5 px-5">
                        <RiskBadge risk={quote.riskLevel} />
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="py-3.5 px-5 text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">No recent quotations found.</div>
            )}
          </div>
        </div>

        {/* Pending Approvals Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">Pending Approvals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quotations awaiting policy review</p>
            </div>
            <Link to="/approvals" className="text-sm font-semibold text-indigo-600 flex items-center hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            {pendingApprovals.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Quote #</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Value</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-600">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingApprovals.map((approval) => (
                    <tr
                      key={approval.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => (window.location.href = `/approvals/${approval.id}`)}
                    >
                      <td className="py-3.5 px-5 text-sm font-medium text-indigo-600">{approval.quoteNumber}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-700 font-medium">{approval.formattedValue}</td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">
                        {new Date(approval.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">No pending approvals. You're all caught up!</div>
            )}
          </div>
        </div>
      </div>

      {/* Policy Governance Banner */}
      <div className="bg-gradient-to-r from-[#e9d5ff] to-[#f3e8ff] rounded-xl p-6 border border-purple-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#714B67] flex items-center justify-center text-white shadow-md shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Policy-Driven Commercial Governance</h3>
            <p className="text-sm text-slate-700 mt-0.5">
              Every quotation pricing change, discount policy evaluation, and counteroffer is evaluated authoritatively on the backend.
            </p>
          </div>
        </div>
        <div>
          <a
            href="/control-tower"
            className="bg-white text-[#714B67] font-semibold py-2 px-4 rounded-lg shadow-sm border border-purple-100 hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            Control Tower <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

// Helper badge components
function RiskBadge({ risk }: { risk?: string }) {
  const normalized = risk?.toUpperCase() || 'LOW';
  const getColors = () => {
    switch (normalized) {
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${getColors()}`}>{normalized}</span>;
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toUpperCase() || 'DRAFT';
  const getColors = () => {
    switch (normalized) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING_MANAGER':
      case 'PENDING_FINANCE':
      case 'UNDER REVIEW':
        return 'bg-yellow-100 text-yellow-700';
      case 'SUBMITTED':
      case 'NEGOTIATING':
        return 'bg-blue-100 text-blue-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${getColors()}`}>{normalized}</span>;
}
