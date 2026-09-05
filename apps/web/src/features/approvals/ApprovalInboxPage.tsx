import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { api } from '../../lib/api/client.js';
import { ApprovalRequestDto } from '@dealflow360/contracts';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Eye,
  RefreshCw,
  Loader2,
  UserCheck,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { KanbanBoard, KanbanColumn } from '../../components/kanban/index.js';
import { ApprovalKanbanCard } from './components/ApprovalKanbanCard.js';

export const ApprovalInboxPage: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN'>('LIST');

  // Modal State for Quick Approve / Reject
  const [activeModal, setActiveModal] = useState<{
    type: 'APPROVE' | 'REJECT';
    approval: ApprovalRequestDto;
  } | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (roleFilter && roleFilter !== 'ALL') {
        params.requiredRole = roleFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get('/approvals', { params });
      if (response.data && response.data.success) {
        setApprovals(response.data.data || []);
      } else {
        setError('Failed to fetch approval requests.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Error connecting to approvals API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApprovals();
  };

  const handleDecisionSubmit = async () => {
    if (!activeModal) return;
    setSubmitting(true);
    setModalError(null);

    try {
      if (activeModal.type === 'APPROVE') {
        await api.post(`/approvals/${activeModal.approval.id}/approve`, {
          comments: decisionComment,
        });
      } else {
        if (!decisionComment.trim()) {
          setModalError('A rejection reason is required.');
          setSubmitting(false);
          return;
        }
        await api.post(`/approvals/${activeModal.approval.id}/reject`, {
          reason: decisionComment,
        });
      }
      setActiveModal(null);
      setDecisionComment('');
      fetchApprovals();
    } catch (err: any) {
      setModalError(err?.response?.data?.error?.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isUserAuthorizedForAction = (approval: ApprovalRequestDto) => {
    if (!role) return false;
    const userRoleStr = role as string;
    if (userRoleStr === 'ADMIN') return true;
    if (userRoleStr !== 'SALES_MANAGER' && userRoleStr !== 'FINANCE_OPERATIONS' && userRoleStr !== 'FINANCE') {
      return false;
    }
    const currentStep = approval.steps.find((s) => s.sequence === approval.currentStepSequence);
    if (!currentStep || currentStep.status !== 'PENDING') return false;

    const reqRoleStr = currentStep.requiredRole as string;
    if (userRoleStr === 'SALES_MANAGER' && reqRoleStr === 'SALES_MANAGER') return true;
    if (
      (userRoleStr === 'FINANCE_OPERATIONS' || userRoleStr === 'FINANCE') &&
      (reqRoleStr === 'FINANCE_OPERATIONS' || reqRoleStr === 'FINANCE')
    ) {
      return true;
    }
    return false;
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'SUPERSEDED':
        return 'default';
      default:
        return 'warning';
    }
  };

  // Metrics
  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const highRiskCount = approvals.filter((a) => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length;

  // Group into Kanban Columns
  const kanbanColumns = useMemo<KanbanColumn<ApprovalRequestDto>[]>(() => {
    const pendingItems = approvals.filter((a) => a.status === 'PENDING');
    const approvedItems = approvals.filter((a) => a.status === 'APPROVED');
    const rejectedItems = approvals.filter((a) => a.status === 'REJECTED');
    const supersededItems = approvals.filter((a) => a.status === 'SUPERSEDED');

    return [
      {
        id: 'PENDING',
        title: 'Pending Action',
        items: pendingItems,
        badgeVariant: 'amber',
        accentColor: 'border-amber-500',
        emptyText: 'No pending approvals',
      },
      {
        id: 'APPROVED',
        title: 'Approved',
        items: approvedItems,
        badgeVariant: 'emerald',
        accentColor: 'border-emerald-500',
        emptyText: 'No approved requests',
      },
      {
        id: 'REJECTED',
        title: 'Rejected',
        items: rejectedItems,
        badgeVariant: 'rose',
        accentColor: 'border-rose-500',
        emptyText: 'No rejected requests',
      },
      {
        id: 'SUPERSEDED',
        title: 'Superseded',
        items: supersededItems,
        badgeVariant: 'slate',
        accentColor: 'border-slate-400',
        emptyText: 'No superseded requests',
      },
    ];
  }, [approvals]);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#714B67]" />
            Commercial Approval Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Governance control room for commercial deal exceptions, discount overrides, and margin policy routing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setViewMode('LIST');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'LIST'
                  ? 'bg-white text-[#714B67] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
            <button
              onClick={() => {
                setViewMode('KANBAN');
                if (statusFilter !== 'ALL') setStatusFilter('ALL');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-[#714B67] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Workflow Board
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={fetchApprovals} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Action</p>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High / Critical Risk</p>
            <p className="text-2xl font-bold text-slate-900">{highRiskCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Active Role</p>
            <p className="text-sm font-bold text-slate-900">{role?.replace('_', ' ') || 'User'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-[#714B67] rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Governance Authority</p>
            <p className="text-xs font-medium text-slate-700">Server-Authoritative</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
            {['PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-[#714B67] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          {/* Search & Role Filters */}
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search quote #, customer, requester..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67]"
            >
              <option value="ALL">All Approval Roles</option>
              <option value="SALES_MANAGER">Sales Manager Step</option>
              <option value="FINANCE_OPERATIONS">Finance Operations Step</option>
            </select>
          </form>
        </div>
      </div>

      {/* Main View Area */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {viewMode === 'KANBAN' ? (
        <KanbanBoard<ApprovalRequestDto>
          columns={kanbanColumns}
          isLoading={loading}
          error={error}
          onRetry={fetchApprovals}
          keyExtractor={(item) => item.id}
          onCardClick={(item) => navigate(`/approvals/${item.id}`)}
          renderCard={(item) => (
            <ApprovalKanbanCard
              approval={item}
              canAction={isUserAuthorizedForAction(item)}
              onApprove={(appr) => {
                setActiveModal({ type: 'APPROVE', approval: appr });
                setDecisionComment('');
                setModalError(null);
              }}
              onReject={(appr) => {
                setActiveModal({ type: 'REJECT', approval: appr });
                setDecisionComment('');
                setModalError(null);
              }}
              onViewDetails={(id) => navigate(`/approvals/${id}`)}
            />
          )}
        />
      ) : loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
          <p className="text-sm font-medium text-slate-600">Loading approval requests...</p>
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Approvals Require Your Attention</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            All commercial requests under your current filters have been processed or non-existent.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((item) => {
            const currentStep = item.steps.find((s) => s.sequence === item.currentStepSequence);
            const canAction = isUserAuthorizedForAction(item);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left Section: Details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-slate-900 font-mono">
                      {item.quoteNumber ? item.quoteNumber : `Approval #${item.id.substring(0, 8)}`}
                    </span>
                    {item.customerName && (
                      <span className="text-sm text-slate-500 font-medium">• {item.customerName}</span>
                    )}

                    <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                      {item.status}
                    </Badge>

                    <Badge variant={getRiskBadgeVariant(item.riskLevel)} size="sm" className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {item.riskLevel} RISK · {item.riskScore.toFixed(1)}
                    </Badge>
                  </div>

                  {/* Commercial Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Net Value</span>
                      <span className="font-bold text-slate-800 font-mono">${item.netTotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Gross Margin</span>
                      <span className={`font-bold font-mono ${item.marginPercentage < 20 ? 'text-red-600' : 'text-slate-800'}`}>
                        {item.marginPercentage.toFixed(1)}% (${item.marginAmount.toLocaleString()})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Requested By</span>
                      <span className="font-semibold text-slate-700">{item.requestedByName || 'Sales Rep'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Pending Step</span>
                      <span className="font-semibold text-[#714B67]">
                        {currentStep ? `Step ${currentStep.sequence}: ${currentStep.requiredRole.replace('_', ' ')}` : 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Policy Violations Summary */}
                  {item.violations && Array.isArray(item.violations) && item.violations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-red-700 bg-red-50/70 p-2 rounded border border-red-100">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                      <span className="font-semibold">{item.violations.length} Governance Violation(s):</span>
                      {item.violations.map((v: any, idx: number) => (
                        <span key={idx} className="bg-red-100/80 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {v.ruleName || v.violatedField}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Section: Actions & Timestamp */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-2.5 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 min-w-0 w-full lg:w-auto shrink-0">
                  {/* Created At Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Created {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {canAction && item.status === 'PENDING' && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setActiveModal({ type: 'REJECT', approval: item });
                            setDecisionComment('');
                            setModalError(null);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setActiveModal({ type: 'APPROVE', approval: item });
                            setDecisionComment('');
                            setModalError(null);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}

                    <Link to={`/approvals/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve / Reject Decision Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {activeModal.type === 'APPROVE' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Approve Commercial Request
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Reject Commercial Request
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600">
              {activeModal.type === 'APPROVE'
                ? `You are approving commercial request for quote '${activeModal.approval.quoteNumber || activeModal.approval.id}'. This will advance the approval step.`
                : `You are rejecting commercial request for quote '${activeModal.approval.quoteNumber || activeModal.approval.id}'. Please provide a mandatory reason.`}
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeModal.type === 'APPROVE' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                rows={3}
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                placeholder={activeModal.type === 'APPROVE' ? 'Add any optional notes for the audit trail...' : 'Specify why this commercial deal is being rejected...'}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant={activeModal.type === 'APPROVE' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleDecisionSubmit}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {activeModal.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
