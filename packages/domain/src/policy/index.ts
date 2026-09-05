export interface PolicyEvaluationRule {
  ruleId: string;
  category: string;
  allowedThreshold: number;
  actualValue: number;
  isViolation: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}
