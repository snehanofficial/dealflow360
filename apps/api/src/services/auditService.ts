import { db, Prisma, Role } from '@dealflow360/db';
import {
  AuditFilterQuery,
  AuditListResponse,
  AuditLogDto,
  AuditEventType,
  AuditEntityType,
} from '@dealflow360/contracts';
import {
  computeStateDiff,
  sanitizeAuditPayload,
  formatAuditEventTitle,
} from '@dealflow360/domain';

export const ENTITY_ALLOWLISTS: Record<string, string[]> = {
  Customer: ['code', 'name', 'email', 'phone', 'tier', 'status', 'creditLimit', 'region', 'accountManager'],
  Product: [
    'sku',
    'name',
    'description',
    'category',
    'unit',
    'taxRate',
    'listPrice',
    'standardCost',
    'maxAllowedDiscount',
    'billingType',
    'recurringPeriod',
    'isActive',
  ],
  PriceList: ['name', 'customerTier', 'currency', 'isDefault', 'isActive'],
  PriceListEntry: ['priceListId', 'productId', 'unitPrice'],
  DiscountPolicyRule: [
    'name',
    'description',
    'customerTier',
    'category',
    'productId',
    'maxDiscountPercent',
    'minMarginPercent',
    'requiredApprovalRole',
    'priority',
    'isActive',
  ],
  ApprovalRequest: [
    'quotationId',
    'requestedById',
    'status',
    'riskScore',
    'riskLevel',
    'netTotal',
    'marginAmount',
    'marginPercentage',
    'currentStepSequence',
  ],
  ApprovalStep: ['approvalRequestId', 'sequence', 'requiredRole', 'status', 'actedById', 'comments'],
  Quotation: [
    'quoteNumber',
    'customerId',
    'createdById',
    'status',
    'subtotal',
    'totalDiscount',
    'netValue',
    'grossMarginPercent',
    'riskScore',
    'riskLevel',
  ],
  QuoteLine: [
    'quotationId',
    'productId',
    'quantity',
    'listPrice',
    'proposedDiscountPercent',
    'discountAmount',
    'netLinePrice',
    'lineCost',
    'lineMarginPercent',
  ],
  PortalToken: ['quotationId', 'expiresAt', 'isRevoked'],
  CounterOffer: ['quotationId', 'proposedDiscountPercent', 'customerNotes', 'status'],
  FulfillmentAllocation: ['quotationId', 'quoteLineId', 'warehouseId', 'allocatedQuantity', 'isOverride'],
  BillingSchedule: [
    'quotationId',
    'totalOneTimeAmount',
    'totalRecurringMonthly',
    'totalRecurringAnnual',
    'billingStartDate',
    'status',
  ],
  DealAlert: ['quotationId', 'alertType', 'severity', 'message', 'isResolved'],
  User: ['email', 'name', 'role', 'isActive'],
};

export interface RecordAuditEventParams {
  eventType: AuditEventType | string;
  action?: string;
  entityType: AuditEntityType | string;
  entityId: string;
  actor?: { id?: string | null; name?: string | null; role?: Role | string | null } | null;
  previousState?: Record<string, any> | null;
  newState?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export async function recordAuditEvent(
  params: RecordAuditEventParams,
  tx?: Prisma.TransactionClient,
): Promise<AuditLogDto> {
  const { eventType, entityType, entityId, actor, previousState, newState, metadata } = params;

  const allowlist = ENTITY_ALLOWLISTS[entityType];

  const cleanPrev = sanitizeAuditPayload(previousState, allowlist);
  const cleanNew = sanitizeAuditPayload(newState, allowlist);
  const cleanMeta = sanitizeAuditPayload(metadata);

  const changes = computeStateDiff(cleanPrev, cleanNew, allowlist);

  const actionText =
    params.action && params.action.trim() !== ''
      ? params.action
      : formatAuditEventTitle(eventType, entityType, changes);

  const actorId = actor?.id || null;
  const actorName = actor?.name || (actorId ? 'Authenticated User' : 'SYSTEM');
  const actorRole = (actor?.role as Role) || null;

  const prismaClient = tx || db;

  if (!prismaClient || !(prismaClient as any).auditLog?.create) {
    return {
      id: `audit-${Date.now()}`,
      eventType: eventType as AuditEventType,
      action: actionText,
      entityType: String(entityType),
      entityId,
      actorId,
      actorName,
      actorRole: actorRole as Role | null,
      previousState: cleanPrev,
      newState: cleanNew,
      changes: changes as any,
      metadata: cleanMeta,
      createdAt: new Date().toISOString(),
    };
  }

  const record = await (prismaClient as any).auditLog.create({
    data: {
      eventType,
      action: actionText,
      entityType,
      entityId,
      actorId,
      actorName,
      actorRole,
      previousState: cleanPrev ? (cleanPrev as Prisma.InputJsonValue) : Prisma.JsonNull,
      newState: cleanNew ? (cleanNew as Prisma.InputJsonValue) : Prisma.JsonNull,
      changes: changes.length > 0 ? (changes as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      metadata: cleanMeta ? (cleanMeta as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  return {
    ...record,
    actorRole: record.actorRole as Role | null,
    eventType: record.eventType as AuditEventType,
    previousState: record.previousState as Record<string, unknown> | null,
    newState: record.newState as Record<string, unknown> | null,
    changes: record.changes as any,
    metadata: record.metadata as Record<string, unknown> | null,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function getAuditLogs(query: AuditFilterQuery): Promise<AuditListResponse> {
  const { search, entityType, entityId, actorId, eventType, startDate, endDate, page, limit } = query;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.AuditLogWhereInput = {};

  if (entityType) {
    whereClause.entityType = entityType;
  }

  if (entityId) {
    whereClause.entityId = entityId;
  }

  if (actorId) {
    whereClause.actorId = actorId;
  }

  if (eventType) {
    whereClause.eventType = eventType;
  }

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }

  if (search && search.trim() !== '') {
    const searchTerm = search.trim();
    whereClause.OR = [
      { action: { contains: searchTerm, mode: 'insensitive' } },
      { entityType: { contains: searchTerm, mode: 'insensitive' } },
      { entityId: { contains: searchTerm, mode: 'insensitive' } },
      { actorName: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (!(db as any)?.auditLog?.findMany) {
    return {
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
    };
  }

  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.auditLog.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: items.map((item) => ({
      ...item,
      actorRole: item.actorRole as Role | null,
      eventType: item.eventType as AuditEventType,
      previousState: item.previousState as Record<string, unknown> | null,
      newState: item.newState as Record<string, unknown> | null,
      changes: item.changes as any,
      metadata: item.metadata as Record<string, unknown> | null,
      createdAt: item.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
): Promise<AuditLogDto[]> {
  if (!(db as any)?.auditLog?.findMany) {
    return [];
  }

  const items = await db.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    ...item,
    actorRole: item.actorRole as Role | null,
    eventType: item.eventType as AuditEventType,
    previousState: item.previousState as Record<string, unknown> | null,
    newState: item.newState as Record<string, unknown> | null,
    changes: item.changes as any,
    metadata: item.metadata as Record<string, unknown> | null,
    createdAt: item.createdAt.toISOString(),
  }));
}
