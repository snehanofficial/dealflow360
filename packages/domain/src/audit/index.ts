export interface AuditChangeItem {
  field: string;
  old: unknown;
  new: unknown;
}

const FORBIDDEN_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'authorization',
  'cookie',
  'secret',
]);

export function sanitizeAuditPayload(
  data: Record<string, any> | null | undefined,
  allowlist?: string[],
): Record<string, any> | null {
  if (!data || typeof data !== 'object') return null;

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_KEYS.has(lowerKey)) {
      continue;
    }

    if (allowlist && allowlist.length > 0 && !allowlist.includes(key)) {
      continue;
    }

    if (value instanceof Date) {
      sanitized[key] = value.toISOString();
    } else if (value !== undefined && typeof value !== 'function') {
      try {
        sanitized[key] = JSON.parse(JSON.stringify(value));
      } catch {
        sanitized[key] = String(value);
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

export function computeStateDiff(
  previous: Record<string, any> | null | undefined,
  current: Record<string, any> | null | undefined,
  allowlist?: string[],
): AuditChangeItem[] {
  if (!previous || !current) return [];

  const changes: AuditChangeItem[] = [];
  const cleanPrev = sanitizeAuditPayload(previous, allowlist) || {};
  const cleanCurr = sanitizeAuditPayload(current, allowlist) || {};

  const allKeys = new Set([...Object.keys(cleanPrev), ...Object.keys(cleanCurr)]);

  for (const key of allKeys) {
    const prevVal = cleanPrev[key];
    const currVal = cleanCurr[key];

    if (JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
      changes.push({
        field: key,
        old: prevVal ?? null,
        new: currVal ?? null,
      });
    }
  }

  return changes;
}

export function formatAuditEventTitle(
  eventType: string,
  entityType: string,
  changes?: AuditChangeItem[] | null,
): string {
  switch (eventType) {
    case 'CUSTOMER_CREATED':
      return `Created ${entityType} account`;
    case 'CUSTOMER_UPDATED':
      return `Updated ${entityType} profile`;
    case 'PRODUCT_CREATED':
      return `Created ${entityType} catalog entry`;
    case 'PRODUCT_UPDATED':
      return `Updated ${entityType} details`;
    case 'PRODUCT_PRICE_CHANGED': {
      const priceChange = changes?.find((c) => c.field === 'listPrice' || c.field === 'unitPrice');
      if (priceChange) {
        return `Changed ${entityType} price from ₹${priceChange.old} to ₹${priceChange.new}`;
      }
      return `Changed ${entityType} price`;
    }
    case 'PRICE_LIST_CREATED':
      return `Created ${entityType}`;
    case 'PRICE_LIST_UPDATED':
      return `Updated ${entityType}`;
    case 'DISCOUNT_POLICY_CREATED':
      return `Created ${entityType}`;
    case 'DISCOUNT_POLICY_UPDATED':
      return `Updated ${entityType}`;
    case 'APPROVAL_REQUESTED':
      return `Submitted commercial ${entityType} for approval`;
    case 'APPROVAL_APPROVED':
      return `Approved commercial ${entityType}`;
    case 'APPROVAL_REJECTED':
      return `Rejected commercial ${entityType}`;
    case 'COMMERCIAL_EVALUATED':
      return `Evaluated commercial governance terms`;
    default:
      return `Mutated ${entityType}`;
  }
}
