export type ApprovalRole = 'SALES_MANAGER' | 'FINANCE';

export interface ApprovalRequirement {
  role: ApprovalRole;
  reason: string;
}
