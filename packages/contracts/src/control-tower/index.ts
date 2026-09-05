import { z } from 'zod';

export const DealAlertSeveritySchema = z.enum(['INFO', 'WARNING', 'CRITICAL']);
export type DealAlertSeverity = z.infer<typeof DealAlertSeveritySchema>;

export const DealAlertTypeSchema = z.enum([
  'STALLED_DEAL',
  'MARGIN_LEAKAGE',
  'FULFILLMENT_RISK',
  'HIGH_RISK',
]);
export type DealAlertType = z.infer<typeof DealAlertTypeSchema>;

export const DealAlertDtoSchema = z.object({
  id: z.string(),
  quotationId: z.string(),
  quoteNumber: z.string().optional(),
  customerName: z.string().optional(),
  alertType: DealAlertTypeSchema,
  severity: DealAlertSeveritySchema,
  message: z.string(),
  isResolved: z.boolean(),
  createdAt: z.string(),
});
export type DealAlertDto = z.infer<typeof DealAlertDtoSchema>;

export const ControlTowerMetricsDtoSchema = z.object({
  totalPipelineValue: z.number(),
  activeQuoteCount: z.number(),
  stalledDealsCount: z.number(),
  marginLeakageCount: z.number(),
  fulfillmentRiskCount: z.number(),
  highRiskDealsCount: z.number(),
  averageGrossMarginPercent: z.number(),
});
export type ControlTowerMetricsDto = z.infer<typeof ControlTowerMetricsDtoSchema>;

export const ControlTowerFilterSchema = z.object({
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  search: z.string().optional(),
  stalledOnly: z.boolean().optional(),
});
export type ControlTowerFilter = z.infer<typeof ControlTowerFilterSchema>;
