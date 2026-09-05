import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, FileText, DollarSign, ShieldAlert,
  CheckCircle, Truck, MoreHorizontal, ArrowRight, Lightbulb
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Mock Data
  const pipelineData = [
    { name: 'Draft', count: 12, value: 320, color: '#E2E8F0' },
    { name: 'Submitted', count: 18, value: 1100, color: '#BAE6FD' },
    { name: 'Under Review', count: 8, value: 480, color: '#FEF08A' },
    { name: 'Approved', count: 6, value: 420, color: '#BBF7D0' },
    { name: 'Ordered', count: 4, value: 250, color: '#DDD6FE' },
  ];

  const revenueData = [
    { name: 'Sep', committed: 150, pipeline: 200 },
    { name: 'Oct', committed: 200, pipeline: 250 },
    { name: 'Nov', committed: 280, pipeline: 400 },
    { name: 'Dec', committed: 320, pipeline: 450 },
    { name: 'Jan', committed: 400, pipeline: 600 },
    { name: 'Feb', committed: 450, pipeline: 350 },
  ];

  const riskData = [
    { name: 'Low', value: 60, color: '#22C55E' },
    { name: 'Medium', value: 25, color: '#F59E0B' },
    { name: 'High', value: 15, color: '#EF4444' },
  ];

  const recentQuotations = [
    { id: 'QT-2025-1042', customer: 'Acme Industries', value: '$250,000', risk: 'High', status: 'Under Review', updated: '2 hours ago' },
    { id: 'QT-2025-1041', customer: 'Global Manufacturing', value: '$120,000', risk: 'Medium', status: 'Submitted', updated: '5 hours ago' },
    { id: 'QT-2025-1040', customer: 'Innotech Solutions', value: '$480,000', risk: 'Low', status: 'Approved', updated: '1 day ago' },
    { id: 'QT-2025-1039', customer: 'Vertex Systems', value: '$75,000', risk: 'Medium', status: 'Draft', updated: '1 day ago' },
    { id: 'QT-2025-1038', customer: 'Summit Logistics', value: '$310,000', risk: 'High', status: 'Needs Info', updated: '2 days ago' },
  ];

  const pendingApprovals = [
    { id: 'QT-2025-1042', customer: 'Acme Industries', value: '$250,000', requested: '2 hours ago' },
    { id: 'QT-2025-1037', customer: 'BuildRight Co.', value: '$180,000', requested: '4 hours ago' },
    { id: 'QT-2025-1035', customer: 'Solaris Energy', value: '$95,000', requested: '1 day ago' },
    { id: 'QT-2025-1031', customer: 'NextGen Parts', value: '$420,000', requested: '1 day ago' },
    { id: 'QT-2025-1028', customer: 'OmniTech', value: '$130,000', requested: '2 days ago' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, {user?.name?.split(' ')[0] || 'John'}! <span className="text-xl sm:text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your deals today.</p>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-600 bg-white px-3 sm:px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <span>Monday, 15 September 2025</span>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-4">
              <span className="text-yellow-500">☀️</span>
              <span>Partly cloudy, 28°C</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/quotations/quote-sample-001"
              className="px-4 py-2 text-sm font-medium text-[#714B67] bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-md transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Open Sample Quote (QT-2026-0001)
            </a>
            <div className="flex bg-[#714B67] text-white rounded-md shadow-sm overflow-hidden hover:bg-[#5F3D56] transition-colors self-start sm:self-auto">
              <button className="px-4 py-2 text-sm font-medium flex items-center gap-2">
                <span className="text-lg leading-none">+</span> New Quotation
              </button>
              <button className="px-2 border-l border-white/20 hover:bg-white/10 flex items-center justify-center">
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Quotations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Total Quotations</p>
              <h3 className="text-2xl font-bold text-slate-900">48</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">12%</span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Estimated Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">$2.4M</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">18%</span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* High Risk Deals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">High Risk Deals</p>
              <h3 className="text-2xl font-bold text-slate-900">6</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm font-medium text-red-500">50%</span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-slate-900">8</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-yellow-500">33%</span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* Orders in Fulfillment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Orders in Fulfillment</p>
              <h3 className="text-2xl font-bold text-slate-900">12</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">20%</span>
            <span className="text-xs text-slate-400 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 xl:col-span-1 overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Deal Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">Quotes by stage and estimated value</p>
            </div>
            <select className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-700 outline-none">
              <option>This Quarter</option>
            </select>
          </div>

          {/* Custom Funnel Implementation */}
          <div className="flex space-x-1 mb-4 h-8">
            {pipelineData.map((stage) => (
              <div key={stage.name} className="flex-1 flex items-center justify-center relative group">
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: stage.color }}
                ></div>
                <span className="relative z-10 text-[10px] font-semibold text-slate-700 truncate px-1">
                  {stage.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-center mt-2 px-1">
            {pipelineData.map(stage => (
              <div key={`val-${stage.name}`} className="flex-1">
                <div className="font-bold text-lg text-slate-900">{stage.count}</div>
                <div className="text-[11px] text-slate-500 font-medium">${stage.value}K</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 xl:col-span-1">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Revenue Forecast</h3>
              <p className="text-xs text-slate-500 mt-1">Expected revenue from active quotations</p>
            </div>
            <select className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-700 outline-none">
              <option>Next 6 Months</option>
            </select>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `$${val}K`} />
                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="committed" stackId="a" fill="#8B5CF6" radius={[0, 0, 4, 4]} barSize={24} />
                <Bar dataKey="pipeline" stackId="a" fill="#C4B5FD" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></div><span className="text-[10px] text-slate-600">Committed</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD]"></div><span className="text-[10px] text-slate-600">Pipeline</span></div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 xl:col-span-1">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900">Risk Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Active quotations by risk level</p>
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
                <span className="text-2xl font-bold text-slate-900 leading-none">48</span>
                <span className="text-[10px] text-slate-500 mt-1">Total</span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-4 pl-4">
              {riskData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-slate-700">{item.name}</span>
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

        {/* Recent Quotations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">Recent Quotations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your latest quotations and their status</p>
            </div>
            <a href="#" className="text-sm font-semibold text-indigo-600 flex items-center hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Quote #</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Customer</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Value</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Risk</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Status</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Updated</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 text-sm font-medium text-indigo-600">{quote.id}</td>
                    <td className="py-3.5 px-5 text-sm text-slate-700">{quote.customer}</td>
                    <td className="py-3.5 px-5 text-sm text-slate-700 font-medium">{quote.value}</td>
                    <td className="py-3.5 px-5">
                      <RiskBadge risk={quote.risk} />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500">{quote.updated}</td>
                    <td className="py-3.5 px-5 text-slate-400 cursor-pointer hover:text-slate-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals (Smaller Table) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">Pending Approvals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quotations waiting for your action</p>
            </div>
            <a href="#" className="text-sm font-semibold text-indigo-600 flex items-center hover:underline">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Quote #</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Value</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-600">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApprovals.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 text-sm font-medium text-indigo-600">{quote.id}</td>
                    <td className="py-3.5 px-5 text-sm text-slate-700 font-medium">{quote.value}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-500">{quote.requested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-[#e9d5ff] to-[#f3e8ff] rounded-xl p-6 border border-purple-200 shadow-sm relative overflow-hidden flex items-center justify-between">
        {/* Decorative background lines */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
          <svg width="300" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 Q 50 20 100 80 T 200 40 T 300 100" stroke="#714B67" strokeWidth="4" fill="none" />
            <path d="M0 100 Q 50 60 100 90 T 200 70 T 300 100" stroke="#714B67" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#714B67] flex items-center justify-center text-white shadow-md">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Turn more quotes into revenue</h3>
            <p className="text-sm text-slate-700 mt-0.5">Use AI-powered insights to identify at-risk deals and get recommended next actions.</p>
          </div>
        </div>
        <div className="relative z-10">
          <button className="bg-white text-[#714B67] font-semibold py-2 px-4 rounded-lg shadow-sm border border-purple-100 hover:bg-purple-50 transition-colors flex items-center gap-2">
            Explore Insights <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

// Helper components for styling
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const getColors = () => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${getColors()}`}>
      {risk}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getColors = () => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Under Review': return 'bg-yellow-100 text-yellow-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      case 'Needs Info': return 'bg-red-100 text-red-700';
      case 'Draft': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${getColors()}`}>
      {status}
    </span>
  );
}
