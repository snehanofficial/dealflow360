import { z } from 'zod';
import { RoleEnum } from '../auth/index.js';
import { CommercialEvaluationSchema } from '../policy/index.js';

export const ApprovalRequestStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUPERSEDED',
]);

export type ApprovalRequestStatus = z.infer<typeof ApprovalRequestStatusEnum>;

export const ApprovalStepStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUPERSEDED',
]);

export type ApprovalStepStatus = z.infer<typeof ApprovalStepStatusEnum>;

export const ApprovalStepDtoSchema = z.object({
  id: z.string(),
  approvalRequestId: z.string(),
  sequence: z.number().int(),
  requiredRole: RoleEnum,
  status: ApprovalStepStatusEnum,
  actedById: z.string().nullable().optional(),
  actedByName: z.string().nullable().optional(),
  actedAt: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApprovalStepDto = z.infer<typeof ApprovalStepDtoSchema>;

export const ApprovalRequestDtoSchema = z.object({
  id: z.string(),
  quotationId: z.string().nullable().optional(),
  quoteNumber: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  requestedById: z.string(),
  requestedByName: z.string().nullable().optional(),
  status: ApprovalRequestStatusEnum,
  riskScore: z.number(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  netTotal: z.number(),
  marginAmount: z.number(),
  marginPercentage: z.number(),
  violations: z.array(z.any()).optional(),
  commercialSummary: z.any().optional(),
  currentStepSequence: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  steps: z.array(ApprovalStepDtoSchema),
});

export type ApprovalRequestDto = z.infer<typeof ApprovalRequestDtoSchema>;

export const CreateApprovalRequestSchema = z.object({
  quotationId: z.string().optional(),
  evaluation: CommercialEvaluationSchema,
  notes: z.string().optional(),
});

export type CreateApprovalRequestInput = z.infer<typeof CreateApprovalRequestSchema>;

export const ApprovalApproveRequestSchema = z.object({
  comments: z.string().optional(),
});

export type ApprovalApproveRequest = z.infer<typeof ApprovalApproveRequestSchema>;

export const ApprovalRejectRequestSchema = z.object({
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters long'),
});

export type ApprovalRejectRequest = z.infer<typeof ApprovalRejectRequestSchema>;

export const ApprovalDecisionSchema = ApprovalApproveRequestSchema;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

export const ApprovalQuerySchema = z.object({
  status: z.string().optional(),
  requiredRole: RoleEnum.optional(),
  quotationId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type ApprovalQueryInput = z.infer<typeof ApprovalQuerySchema>;
