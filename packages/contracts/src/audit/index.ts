import { z } from 'zod';
import { RoleEnum } from '../auth/index.js';

export const AuditEventTypeEnum = z.enum([
  'CUSTOMER_CREATED',
  'CUSTOMER_UPDATED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_PRICE_CHANGED',
  'PRICE_LIST_CREATED',
  'PRICE_LIST_UPDATED',
  'DISCOUNT_POLICY_CREATED',
  'DISCOUNT_POLICY_UPDATED',
  'APPROVAL_REQUESTED',
  'APPROVAL_APPROVED',
  'APPROVAL_REJECTED',
  'COMMERCIAL_EVALUATED',
  'QUOTE_CREATED',
  'QUOTE_LINE_ADDED',
  'QUOTE_LINE_UPDATED',
  'QUOTE_LINE_DELETED',
  'QUOTE_SUBMITTED',
  'PORTAL_TOKEN_GENERATED',
  'COUNTEROFFER_SUBMITTED',
  'FULFILLMENT_ALLOCATED',
  'BILLING_SCHEDULE_GENERATED',
  'DEAL_ALERT_RESOLVED',
  'USER_LOGGED_IN',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeEnum>;

export const AuditEntityTypeEnum = z.enum([
  'Customer',
  'Product',
  'PriceList',
  'DiscountPolicyRule',
  'ApprovalRequest',
  'Quotation',
  'QuoteLine',
  'PortalToken',
  'CounterOffer',
  'FulfillmentAllocation',
  'BillingSchedule',
  'DealAlert',
  'User',
]);

export type AuditEntityType = z.infer<typeof AuditEntityTypeEnum>;

export const AuditChangeItemSchema = z.object({
  field: z.string(),
  old: z.unknown(),
  new: z.unknown(),
});

export type AuditChangeItem = z.infer<typeof AuditChangeItemSchema>;

export const AuditLogSchema = z.object({
  id: z.string(),
  eventType: AuditEventTypeEnum,
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  actorId: z.string().nullable(),
  actorName: z.string().nullable(),
  actorRole: RoleEnum.nullable(),
  previousState: z.record(z.unknown()).nullable(),
  newState: z.record(z.unknown()).nullable(),
  changes: z.array(AuditChangeItemSchema).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
});

export type AuditLogDto = z.infer<typeof AuditLogSchema>;

export const AuditFilterQuerySchema = z.object({
  search: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  eventType: AuditEventTypeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AuditFilterQuery = z.infer<typeof AuditFilterQuerySchema>;

export const AuditListResponseSchema = z.object({
  items: z.array(AuditLogSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type AuditListResponse = z.infer<typeof AuditListResponseSchema>;
