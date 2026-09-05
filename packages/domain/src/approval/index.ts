export type ApprovalRole = 'SALES_MANAGER' | 'FINANCE_OPERATIONS' | 'ADMIN';

export interface ApprovalRequirement {
  role: ApprovalRole;
  reason: string;
}

export function canRoleApproveStep(userRole: string, requiredRole: string): boolean {
  if (userRole === 'ADMIN') return true;
  if (userRole === requiredRole) return true;
  // Handle alias if FINANCE and FINANCE_OPERATIONS are used interchangeably
  if (
    (userRole === 'FINANCE' || userRole === 'FINANCE_OPERATIONS') &&
    (requiredRole === 'FINANCE' || requiredRole === 'FINANCE_OPERATIONS')
  ) {
    return true;
  }
  return false;
}

export interface StepStatusSummary {
  sequence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
}

export interface DerivedRequestState {
  requestStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
  nextSequence: number;
  isComplete: boolean;
}

export function deriveNextRequestState(steps: StepStatusSummary[]): DerivedRequestState {
  if (!steps || steps.length === 0) {
    return { requestStatus: 'APPROVED', nextSequence: 0, isComplete: true };
  }

  // Sort steps by sequence
  const sorted = [...steps].sort((a, b) => a.sequence - b.sequence);

  // If any step is rejected, request is REJECTED
  if (sorted.some((s) => s.status === 'REJECTED')) {
    return { requestStatus: 'REJECTED', nextSequence: 0, isComplete: true };
  }

  // If any step is superseded, request is SUPERSEDED
  if (sorted.some((s) => s.status === 'SUPERSEDED')) {
    return { requestStatus: 'SUPERSEDED', nextSequence: 0, isComplete: true };
  }

  // Find first pending step
  const pendingStep = sorted.find((s) => s.status === 'PENDING');
  if (pendingStep) {
    return { requestStatus: 'PENDING', nextSequence: pendingStep.sequence, isComplete: false };
  }

  // If all steps are APPROVED
  if (sorted.every((s) => s.status === 'APPROVED')) {
    return { requestStatus: 'APPROVED', nextSequence: sorted.length + 1, isComplete: true };
  }

  return { requestStatus: 'PENDING', nextSequence: 1, isComplete: false };
}
