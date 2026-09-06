import { z } from 'zod';
import { RoleEnum } from '../auth/index.js';

export const DashboardKpiSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.number(), z.string()]),
  formattedValue: z.string(),
  change: z.string().optional(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
  icon: z.string(),
  actionUrl: z.string().optional(),
});

export type DashboardKpiDto = z.infer<typeof DashboardKpiSchema>;

export const DashboardAlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['CRITICAL', 'HIGH', 'NORMAL']),
  category: z.enum(['APPROVAL', 'NEGOTIATION', 'FULFILLMENT', 'INVENTORY', 'BILLING']),
  actionUrl: z.string(),
  actionLabel: z.string(),
});

export type DashboardAlertDto = z.infer<typeof DashboardAlertSchema>;

export const DashboardPipelineStageSchema = z.object({
  name: z.string(),
  count: z.number(),
  value: z.number(),
  color: z.string(),
});

export type DashboardPipelineStageDto = z.infer<typeof DashboardPipelineStageSchema>;

export const DashboardRecentQuotationSchema = z.object({
  id: z.string(),
  quoteNumber: z.string(),
  customerName: z.string(),
  value: z.number(),
  formattedValue: z.string(),
  riskLevel: z.string(),
  status: z.string(),
  updatedAt: z.string(),
});

export type DashboardRecentQuotationDto = z.infer<typeof DashboardRecentQuotationSchema>;

export const DashboardPendingApprovalSchema = z.object({
  id: z.string(),
  quoteNumber: z.string(),
  customerName: z.string(),
  value: z.number(),
  formattedValue: z.string(),
  requestedAt: z.string(),
});

export type DashboardPendingApprovalDto = z.infer<typeof DashboardPendingApprovalSchema>;

export const DashboardRecentActivitySchema = z.object({
  id: z.string(),
  eventType: z.string(),
  action: z.string(),
  actorName: z.string(),
  createdAt: z.string(),
});

export type DashboardRecentActivityDto = z.infer<typeof DashboardRecentActivitySchema>;

export const DashboardResponseSchema = z.object({
  role: RoleEnum,
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  kpis: z.array(DashboardKpiSchema),
  alerts: z.array(DashboardAlertSchema),
  pipeline: z.array(DashboardPipelineStageSchema),
  recentQuotations: z.array(DashboardRecentQuotationSchema),
  pendingApprovals: z.array(DashboardPendingApprovalSchema),
  recentActivity: z.array(DashboardRecentActivitySchema),
});

export type DashboardResponseDto = z.infer<typeof DashboardResponseSchema>;
