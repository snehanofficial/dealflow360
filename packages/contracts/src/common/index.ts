import { z } from 'zod';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
      })
      .optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const PolicyViolationSchema = z.object({
  ruleId: z.string(),
  ruleName: z.string(),
  allowedValue: z.union([z.number(), z.string()]),
  proposedValue: z.union([z.number(), z.string()]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  explanation: z.string(),
});

export type PolicyViolationDto = z.infer<typeof PolicyViolationSchema>;

export const CommercialEvaluationSchema = z.object({
  quoteId: z.string(),
  netTotal: z.number(),
  marginAmount: z.number(),
  marginPercentage: z.number(),
  riskScore: z.number().min(0).max(10),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  violations: z.array(PolicyViolationSchema),
  requiredApprovalRoles: z.array(z.enum(['SALES_MANAGER', 'FINANCE'])),
  requiresApproval: z.boolean(),
  evaluatedAt: z.string(),
});

export type CommercialEvaluationDto = z.infer<typeof CommercialEvaluationSchema>;

