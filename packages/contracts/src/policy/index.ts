import { z } from 'zod';
import { CustomerTierEnum } from '../customer/index.js';
import { RoleEnum } from '../auth/index.js';

export const DiscountPolicyRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().nullable().optional(),
  customerTier: CustomerTierEnum.nullable().optional(),
  category: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  maxDiscountPercent: z.number().min(0).max(100),
  minMarginPercent: z.number().min(0).max(100).nullable().optional(),
  requiredApprovalRole: RoleEnum.default('SALES_MANAGER'),
  priority: z.number().int().default(10),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DiscountPolicyRuleDto = z.infer<typeof DiscountPolicyRuleSchema>;

export const CreateDiscountPolicyRuleSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  customerTier: CustomerTierEnum.nullable().optional(),
  category: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  maxDiscountPercent: z.number().min(0, 'Max discount cannot be negative').max(100, 'Max discount cannot exceed 100%'),
  minMarginPercent: z.number().min(0).max(100).nullable().optional(),
  requiredApprovalRole: RoleEnum.optional().default('SALES_MANAGER'),
  priority: z.number().int().optional().default(10),
  isActive: z.boolean().optional().default(true),
});

export type CreateDiscountPolicyRuleRequest = z.infer<typeof CreateDiscountPolicyRuleSchema>;

export const UpdateDiscountPolicyRuleSchema = CreateDiscountPolicyRuleSchema.partial();
export type UpdateDiscountPolicyRuleRequest = z.infer<typeof UpdateDiscountPolicyRuleSchema>;

export const PolicyViolationSchema = z.object({
  ruleId: z.string().optional(),
  ruleName: z.string(),
  violatedField: z.enum(['MAX_DISCOUNT', 'MIN_MARGIN', 'PRODUCT_MAX_DISCOUNT']),
  allowedValue: z.number(),
  proposedValue: z.number(),
  severity: z.enum(['WARNING', 'VIOLATION', 'CRITICAL']),
  message: z.string(),
});

export type PolicyViolationDto = z.infer<typeof PolicyViolationSchema>;

export const EvaluationLineInputSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  proposedDiscountPercent: z.number().min(0).max(100),
  unitPriceOverride: z.number().optional(),
});

export type EvaluationLineInput = z.infer<typeof EvaluationLineInputSchema>;

export const EvaluateCommercialScenarioSchema = z.object({
  customerId: z.string().optional(),
  customerTier: CustomerTierEnum.optional(),
  currency: z.string().optional().default('USD'),
  lines: z.array(EvaluationLineInputSchema).min(1, 'At least one line item is required'),
});

export type EvaluateCommercialScenarioRequest = z.infer<typeof EvaluateCommercialScenarioSchema>;

export const LineEvaluationDetailSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  productName: z.string(),
  category: z.string(),
  quantity: z.number(),
  effectiveUnitPrice: z.number(),
  lineSubtotal: z.number(),
  proposedDiscountPercent: z.number(),
  discountAmount: z.number(),
  netUnitPrice: z.number(),
  netLineTotal: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
  marginAmount: z.number(),
  marginPercentage: z.number(),
  violations: z.array(PolicyViolationSchema),
});

export type LineEvaluationDetail = z.infer<typeof LineEvaluationDetailSchema>;

export const CommercialEvaluationSchema = z.object({
  quoteId: z.string().optional(),
  netTotal: z.number(),
  marginAmount: z.number(),
  marginPercentage: z.number(),
  riskScore: z.number().min(0).max(10),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  violations: z.array(PolicyViolationSchema),
  requiredApprovalRoles: z.array(RoleEnum),
  requiresApproval: z.boolean(),
  evaluatedAt: z.string(),
  lineEvaluations: z.array(LineEvaluationDetailSchema).optional(),
});

export type CommercialEvaluationDto = z.infer<typeof CommercialEvaluationSchema>;
