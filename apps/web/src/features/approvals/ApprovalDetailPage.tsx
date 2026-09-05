import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { api } from '../../lib/api/client.js';
import { ApprovalRequestDto, ApprovalStepDto } from '@dealflow360/contracts';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  FileText,
  DollarSign,
  TrendingDown,
  Loader2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { ApprovalStepper } from './ApprovalStepper.js';

export const ApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [approval, setApproval] = useState<ApprovalRequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchApprovalDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/approvals/${id}`);
      if (response.data && response.data.success) {
        setApproval(response.data.data);
      } else {
        setError('Failed to load approval request detail.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Error fetching approval detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalDetail();
  }, [id]);

  const isUserAuthorizedForAction = () => {
    if (!approval || !role) return false;
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

  const handleAction = async (type: 'APPROVE' | 'REJECT') => {
    if (!id) return;
    setSubmitting(true);
    setActionError(null);

    try {
      if (type === 'APPROVE') {
        await api.post(`/approvals/${id}/approve`, { comments });
      } else {
        if (!rejectionReason.trim()) {
          setActionError('A rejection reason is required to reject an approval request.');
          setSubmitting(false);
          return;
        }
        await api.post(`/approvals/${id}/reject`, { reason: rejectionReason });
      }
      setActionType(null);
      setComments('');
      setRejectionReason('');
      fetchApprovalDetail();
    } catch (err: any) {
      setActionError(err?.response?.data?.error?.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67]" />
        <p className="text-sm font-medium text-slate-600">Loading approval request detail...</p>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="space-y-4">
        <Link to="/approvals" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Approvals
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error || 'Approval request not found.'}
        </div>
      </div>
    );
  }

  const currentStep = approval.steps.find((s) => s.sequence === approval.currentStepSequence);
  const canAction = isUserAuthorizedForAction();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/approvals"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#714B67] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Approval Inbox
        </Link>
        <span className="text-xs text-slate-400 font-mono">ID: {approval.id}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {approval.quoteNumber ? `Quotation ${approval.quoteNumber}` : `Approval Request`}
              </h1>
              <Badge variant={getStatusBadgeVariant(approval.status)} size="md">
                {approval.status}
              </Badge>
              <Badge variant={getRiskBadgeVariant(approval.riskLevel)} size="md" className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {approval.riskLevel} RISK · {approval.riskScore.toFixed(1)} / 10.0
              </Badge>
            </div>
            {approval.customerName && (
              <p className="text-sm text-slate-500 font-medium mt-1">
                Customer: <span className="text-slate-800 font-bold">{approval.customerName}</span>
              </p>
            )}
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <div>
              Requested By: <span className="font-semibold text-slate-700">{approval.requestedByName || 'Sales Rep'}</span>
            </div>
            <div>
              Submitted: {new Date(approval.createdAt).toLocaleDateString()} {new Date(approval.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left (Commercial Summary & Violations), Right (Approval Timeline & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Commercial Totals & Margins */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#714B67]" />
              Commercial Evaluation Summary
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Net Commercial Deal Total</span>
                <span className="text-xl font-bold text-slate-900">${approval.netTotal.toLocaleString()}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Gross Margin %</span>
                <span
                  className={`text-xl font-bold ${
                    approval.marginPercentage < 20 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {approval.marginPercentage.toFixed(1)}%
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Gross Margin Amount</span>
                <span className="text-xl font-bold text-slate-900">${approval.marginAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Explainable Policy Violations Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Explainable Risk & Governed Policy Violations
            </h2>

            {!approval.violations || !Array.isArray(approval.violations) || approval.violations.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No policy violations recorded. Deal requires approval due to risk score or deal volume threshold.
              </div>
            ) : (
              <div className="space-y-3">
                {approval.violations.map((violation: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900">{violation.ruleName || violation.violatedField}</span>
                      <Badge variant={violation.severity === 'CRITICAL' ? 'danger' : 'warning'} size="sm">
                        {violation.severity}
                      </Badge>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{violation.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium pt-1">
                      <span>Allowed Limit: <strong className="text-emerald-700">{violation.allowedValue}%</strong></span>
                      <span>Proposed Value: <strong className="text-red-700">{violation.proposedValue}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Stepper Timeline & Decision Form */}
        <div className="space-y-6">
          {/* Approval Workflow Timeline */}
          <ApprovalStepper
            steps={approval.steps}
            currentStepSequence={approval.currentStepSequence}
            requestStatus={approval.status}
          />

          {/* Decision Action Form */}
          {approval.status === 'PENDING' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#714B67]" />
                Make Approval Decision
              </h2>

              {!canAction ? (
                <div className="p-4 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl">
                  You are viewing this request in read-only mode. Actioning requires{' '}
                  <strong className="text-slate-800">
                    {currentStep?.requiredRole.replace('_', ' ') || 'authorized role'}
                  </strong>.
                </div>
              ) : (
                <div className="space-y-4">
                  {actionError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                      {actionError}
                    </div>
                  )}

                  {/* Decision Type Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActionType('APPROVE')}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                        actionType === 'APPROVE'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Step
                    </button>

                    <button
                      onClick={() => setActionType('REJECT')}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                        actionType === 'REJECT'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Deal
                    </button>
                  </div>

                  {actionType === 'APPROVE' && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Approval Comments (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add optional notes for the commercial audit trail..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                      />
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => handleAction('APPROVE')}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Confirm Step Approval
                      </Button>
                    </div>
                  )}

                  {actionType === 'REJECT' && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Rejection Reason (Required)
                      </label>
                      <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="State why this commercial deal violates governance policy..."
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={() => handleAction('REJECT')}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Confirm Rejection
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
