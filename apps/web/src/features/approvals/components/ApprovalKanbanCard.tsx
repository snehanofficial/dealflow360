import React from 'react';
import { ApprovalRequestDto } from '@dealflow360/contracts';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';

export interface ApprovalKanbanCardProps {
  approval: ApprovalRequestDto;
  canAction: boolean;
  onApprove: (approval: ApprovalRequestDto) => void;
  onReject: (approval: ApprovalRequestDto) => void;
  onViewDetails: (approvalId: string) => void;
}

export const ApprovalKanbanCard: React.FC<ApprovalKanbanCardProps> = ({
  approval,
  canAction,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  const currentStep = approval.steps.find((s) => s.sequence === approval.currentStepSequence);

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-[#714B67]/50 rounded-xl p-4 space-y-3 shadow-xs hover:shadow-md transition-all duration-150 group">
      {/* Header: Quote Number & Risk Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-sm text-slate-900 font-mono group-hover:text-[#714B67] transition-colors">
          {approval.quoteNumber || `Approval #${approval.id.substring(0, 8)}`}
        </span>

        <Badge
          variant={getRiskBadgeVariant(approval.riskLevel)}
          size="sm"
          className="flex items-center gap-1 shrink-0 text-[10px]"
        >
          <ShieldAlert className="w-3 h-3" />
          {approval.riskLevel} RISK · {approval.riskScore.toFixed(1)}
        </Badge>
      </div>

      {/* Customer & Requester */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-slate-800">
          {approval.customerName || 'Customer'}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>By: <strong className="text-slate-700">{approval.requestedByName || 'Sales Rep'}</strong></span>
          <span className="text-slate-400 font-mono text-[10px]">
            {new Date(approval.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Commercial Overview Box */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Value</span>
          <span className="font-bold text-slate-800 font-mono">${approval.netTotal.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gross Margin</span>
          <span
            className={`font-bold font-mono ${
              approval.marginPercentage < 20 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {approval.marginPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Required Role Step */}
      <div className="text-[11px] bg-purple-50/60 border border-purple-100 text-purple-900 p-2 rounded-md flex items-center justify-between">
        <span className="text-slate-500 font-medium">Pending Step:</span>
        <span className="font-bold flex items-center gap-1 text-[#714B67]">
          <UserCheck className="w-3 h-3 text-[#714B67]" />
          {currentStep ? currentStep.requiredRole.replace('_', ' ') : 'Completed'}
        </span>
      </div>

      {/* Governance Violations snippet */}
      {approval.violations && Array.isArray(approval.violations) && approval.violations.length > 0 && (
        <div className="text-[10px] text-red-700 bg-red-50 p-1.5 rounded border border-red-100 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
          <span className="font-semibold truncate">
            {approval.violations.length} policy exception(s) detected
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-[11px] py-1 px-2.5"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(approval.id);
          }}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Details
        </Button>

        {canAction && approval.status === 'PENDING' && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="danger"
              size="sm"
              className="text-[11px] py-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onReject(approval);
              }}
            >
              <XCircle className="w-3.5 h-3.5 mr-0.5" />
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-[11px] py-1 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(approval);
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
