import React from 'react';
import { Check, X, Clock, Calendar, UserCheck, MessageSquare } from 'lucide-react';
import { ApprovalStepDto, ApprovalRequestStatus } from '@dealflow360/contracts';
import { Badge } from '../../components/ui/Badge';

export interface ApprovalStepperProps {
  steps: ApprovalStepDto[];
  currentStepSequence: number;
  requestStatus: ApprovalRequestStatus;
  className?: string;
}

const roleNameMap: Record<string, string> = {
  SALES_MANAGER: 'Sales Manager',
  FINANCE_OPERATIONS: 'Finance Operations',
  ADMIN: 'System Admin',
  SALES_REP: 'Sales Representative',
  CUSTOMER: 'Customer',
};

const getRoleDisplayName = (roleStr: string): string => {
  return roleNameMap[roleStr] || roleStr.replace(/_/g, ' ');
};

export const ApprovalStepper: React.FC<ApprovalStepperProps> = ({
  steps,
  currentStepSequence,
  requestStatus,
  className = '',
}) => {
  const sortedSteps = [...steps].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <UserCheck className="w-4.5 h-4.5 text-[#714B67]" />
          Approval Routing Workflow
        </h2>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
          {sortedSteps.length} Step{sortedSteps.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Stepper Timeline */}
      <div className="relative pl-7 space-y-6 pt-1 pb-1">
        {sortedSteps.map((step, index) => {
          const isLast = index === sortedSteps.length - 1;
          const isCurrentPending =
            step.sequence === currentStepSequence && requestStatus === 'PENDING' && step.status === 'PENDING';
          const isApproved = step.status === 'APPROVED';
          const isRejected = step.status === 'REJECTED';
          const isSuperseded = step.status === 'SUPERSEDED';

          // Compact circle styles adhering to DESIGN.md tokens
          let nodeCircleStyle = 'bg-[#F8F9FA] text-[#6C757D] border-[#E5E7EB]';
          let connectorColor = 'bg-slate-200';
          let roleTextColor = 'text-slate-600 font-medium';

          if (isApproved) {
            nodeCircleStyle = 'bg-[#DCFCE7] text-[#166534] border-[#28A745]';
            connectorColor = 'bg-[#28A745]';
            roleTextColor = 'text-slate-900 font-bold';
          } else if (isRejected) {
            nodeCircleStyle = 'bg-[#FEE2E2] text-[#991B1B] border-[#DC3545]';
            connectorColor = 'bg-[#DC3545]';
            roleTextColor = 'text-slate-900 font-bold';
          } else if (isCurrentPending) {
            nodeCircleStyle = 'bg-[#714B67] text-white border-[#714B67] ring-3 ring-[#F3E9F1]';
            roleTextColor = 'text-[#714B67] font-bold';
          } else if (isSuperseded) {
            nodeCircleStyle = 'bg-[#F1F3F5] text-[#6C757D] border-[#ADB5BD]';
            roleTextColor = 'text-slate-400 line-through';
          }

          const badgeVariant = isApproved
            ? 'success'
            : isRejected
            ? 'danger'
            : isCurrentPending
            ? 'warning'
            : isSuperseded
            ? 'default'
            : 'default';

          return (
            <div key={step.id || step.sequence} className="relative group">
              {/* Timeline Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-[-17px] top-5 bottom-[-24px] w-[2px] transition-colors ${connectorColor}`}
                  aria-hidden="true"
                />
              )}

              {/* Compact Step Node Circle (w-5 h-5 = 20px) */}
              <div
                className={`absolute left-[-27px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all text-[10px] font-bold ${nodeCircleStyle}`}
              >
                {isApproved ? (
                  <Check className="w-3 h-3 stroke-[2.5]" />
                ) : isRejected ? (
                  <X className="w-3 h-3 stroke-[2.5]" />
                ) : isSuperseded ? (
                  <Clock className="w-2.5 h-2.5 text-[#6C757D]" />
                ) : (
                  <span>{step.sequence}</span>
                )}
              </div>

              {/* Step Details & Content */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs uppercase tracking-wide ${roleTextColor}`}>
                      {getRoleDisplayName(step.requiredRole)}
                    </span>
                    {isCurrentPending && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F3E9F1] text-[#714B67]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#714B67] animate-pulse mr-1" />
                        Active
                      </span>
                    )}
                  </div>

                  <Badge variant={badgeVariant} size="sm">
                    {step.status}
                  </Badge>
                </div>

                {/* Actor Info & Timestamp */}
                {(step.actedByName || step.actedAt) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                    {step.actedByName && (
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {step.actedByName}
                      </span>
                    )}
                    {step.actedAt && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(step.actedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                )}

                {/* Comments Callout Container */}
                {step.comments && (
                  <div className="mt-2 px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                    <MessageSquare className="w-3.5 h-3.5 text-[#714B67] shrink-0 mt-0.5" />
                    <p className="italic text-slate-700 leading-relaxed font-sans">"{step.comments}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
