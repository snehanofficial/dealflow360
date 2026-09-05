import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client.js';
import {
  AuditLogDto,
  AuditListResponse,
  AuditEventType,
} from '@dealflow360/contracts';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Tag,
  Box,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      if (eventTypeFilter) params.eventType = eventTypeFilter;

      const res = await api.get('/audit', { params });
      if (res.data && res.data.success && res.data.data) {
        const data: AuditListResponse = res.data.data;
        setLogs(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load audit history.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityTypeFilter, eventTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setSearch('');
    setEntityTypeFilter('');
    setEventTypeFilter('');
    setPage(1);
  };

  const getEventBadgeVariant = (eventType: string): 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default' => {
    if (eventType.includes('APPROVED') || eventType.includes('CREATED')) return 'success';
    if (eventType.includes('REJECTED')) return 'danger';
    if (eventType.includes('UPDATED') || eventType.includes('CHANGED')) return 'warning';
    if (eventType.includes('REQUESTED')) return 'purple';
    return 'default';
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Customer':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'Product':
        return <Box className="w-4 h-4 text-emerald-500" />;
      case 'PriceList':
        return <Tag className="w-4 h-4 text-purple-500" />;
      case 'DiscountPolicyRule':
        return <Shield className="w-4 h-4 text-amber-500" />;
      case 'ApprovalRequest':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'Quotation':
      case 'QuoteLine':
        return <FileText className="w-4 h-4 text-cyan-500" />;
      case 'PortalToken':
      case 'CounterOffer':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'FulfillmentAllocation':
        return <Box className="w-4 h-4 text-teal-500" />;
      case 'BillingSchedule':
        return <Tag className="w-4 h-4 text-[#714B67]" />;
      case 'DealAlert':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'User':
        return <User className="w-4 h-4 text-slate-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-[#714B67]" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail & Commercial Event History</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Immutable, append-only governance trail capturing business mutations, price adjustments, and approval decisions.
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Governance Events</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Adjustments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {logs.filter((l) => l.eventType.includes('PRICE')).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Events</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {logs.filter((l) => l.entityType === 'DiscountPolicyRule').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approvals Recorded</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {logs.filter((l) => l.entityType === 'ApprovalRequest').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, entity ID, or actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Entity Types</option>
              <option value="Customer">Customer</option>
              <option value="Product">Product</option>
              <option value="PriceList">Price List</option>
              <option value="DiscountPolicyRule">Discount Policy</option>
              <option value="ApprovalRequest">Approval Request</option>
              <option value="Quotation">Quotation</option>
              <option value="QuoteLine">Quote Line</option>
              <option value="PortalToken">Portal Token</option>
              <option value="CounterOffer">Counter Offer</option>
              <option value="FulfillmentAllocation">Fulfillment Allocation</option>
              <option value="BillingSchedule">Billing Schedule</option>
              <option value="DealAlert">Deal Alert</option>
              <option value="User">User</option>
            </select>

            <select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="">All Event Types</option>
              <option value="CUSTOMER_CREATED">CUSTOMER_CREATED</option>
              <option value="CUSTOMER_UPDATED">CUSTOMER_UPDATED</option>
              <option value="PRODUCT_CREATED">PRODUCT_CREATED</option>
              <option value="PRODUCT_UPDATED">PRODUCT_UPDATED</option>
              <option value="PRODUCT_PRICE_CHANGED">PRODUCT_PRICE_CHANGED</option>
              <option value="PRICE_LIST_CREATED">PRICE_LIST_CREATED</option>
              <option value="PRICE_LIST_UPDATED">PRICE_LIST_UPDATED</option>
              <option value="DISCOUNT_POLICY_CREATED">DISCOUNT_POLICY_CREATED</option>
              <option value="DISCOUNT_POLICY_UPDATED">DISCOUNT_POLICY_UPDATED</option>
              <option value="APPROVAL_REQUESTED">APPROVAL_REQUESTED</option>
              <option value="APPROVAL_APPROVED">APPROVAL_APPROVED</option>
              <option value="APPROVAL_REJECTED">APPROVAL_REJECTED</option>
              <option value="QUOTE_CREATED">QUOTE_CREATED</option>
              <option value="QUOTE_LINE_ADDED">QUOTE_LINE_ADDED</option>
              <option value="QUOTE_LINE_UPDATED">QUOTE_LINE_UPDATED</option>
              <option value="QUOTE_LINE_DELETED">QUOTE_LINE_DELETED</option>
              <option value="QUOTE_SUBMITTED">QUOTE_SUBMITTED</option>
              <option value="PORTAL_TOKEN_GENERATED">PORTAL_TOKEN_GENERATED</option>
              <option value="COUNTEROFFER_SUBMITTED">COUNTEROFFER_SUBMITTED</option>
              <option value="FULFILLMENT_ALLOCATED">FULFILLMENT_ALLOCATED</option>
              <option value="BILLING_SCHEDULE_GENERATED">BILLING_SCHEDULE_GENERATED</option>
              <option value="DEAL_ALERT_RESOLVED">DEAL_ALERT_RESOLVED</option>
              <option value="USER_LOGGED_IN">USER_LOGGED_IN</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-[#714B67] text-white rounded-md text-sm font-medium hover:bg-[#5e3e56] transition-colors"
            >
              Search
            </button>

            {(search || entityTypeFilter || eventTypeFilter) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#714B67] mb-2" />
            Loading governance audit log...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">
            <XCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            No audit records match the selected query criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Event / Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getEventBadgeVariant(log.eventType)} size="sm">
                            {log.eventType}
                          </Badge>
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{log.action}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getEntityIcon(log.entityType)}
                        <span className="font-medium text-slate-700">{log.entityType}</span>
                        <span className="text-xs text-slate-400 font-mono">({log.entityId.substring(0, 8)})</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{log.actorName || 'SYSTEM'}</p>
                          {log.actorRole && (
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {log.actorRole.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#714B67] bg-[#F3E9F1] rounded hover:bg-[#e8d5e5] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{logs.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> governance records (Page {page} of {totalPages})
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Diff Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Audit Record Details</h3>
                <p className="text-xs text-slate-500">{selectedLog.action}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Event Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Event Type</span>
                  <span className="font-mono text-slate-800">{selectedLog.eventType}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Entity</span>
                  <span className="text-slate-800">{selectedLog.entityType} ({selectedLog.entityId})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Actor</span>
                  <span className="text-slate-800">{selectedLog.actorName || 'SYSTEM'} {selectedLog.actorRole ? `(${selectedLog.actorRole})` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Timestamp</span>
                  <span className="text-slate-800">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Field Changes Table */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Field Changes Diff</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="p-2.5">Field</th>
                          <th className="p-2.5">Before Value</th>
                          <th className="p-2.5">After Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedLog.changes.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-800">{item.field}</td>
                            <td className="p-2.5 text-red-600 bg-red-50/50 font-mono">
                              {item.old === null ? 'null' : String(item.old)}
                            </td>
                            <td className="p-2.5 text-emerald-600 bg-emerald-50/50 font-mono">
                              {item.new === null ? 'null' : String(item.new)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-100">
                    No individual field-level state changes recorded for this event.
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
