import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const quotesMap = new Map<string, any>();
  const alertsMap = new Map<string, any>();

  const customer1 = { id: 'cust-ct-01', name: 'Control Tower Corp', code: 'CUST-CT' };

  const quoteStalled = {
    id: 'quote-stalled-01',
    quoteNumber: 'QT-CT-001',
    status: 'DRAFT',
    subtotal: 100000,
    totalDiscount: 5000,
    netValue: 95000,
    grossMarginPercent: 35,
    riskScore: 2.0,
    riskLevel: 'LOW',
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    customer: customer1,
    lines: [{ id: 'l-1', productId: 'p-1', quantity: 5 }],
    fulfillmentAllocations: [],
  };

  quotesMap.set(quoteStalled.id, quoteStalled);

  const initialAlert = {
    id: 'alert-01',
    quotationId: quoteStalled.id,
    alertType: 'STALLED_DEAL',
    severity: 'CRITICAL',
    message: 'Quote QT-CT-001 inactive for 14 days',
    isResolved: false,
    quotation: quoteStalled,
  };
  alertsMap.set(initialAlert.id, initialAlert);

  return {
    db: {
      quotation: {
        findMany: vi.fn(async () => Array.from(quotesMap.values())),
      },
      dealAlert: {
        findFirst: vi.fn(async ({ where }: { where: any }) => {
          return Array.from(alertsMap.values()).find(
            (a) => a.quotationId === where.quotationId && a.alertType === where.alertType && !a.isResolved,
          ) || null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newAlert = { id: `alert-${Date.now()}`, ...data };
          alertsMap.set(newAlert.id, newAlert);
          return newAlert;
        }),
        findMany: vi.fn(async () => Array.from(alertsMap.values()).filter((a) => !a.isResolved)),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => alertsMap.get(where.id) || null),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const alert = alertsMap.get(where.id);
          if (!alert) return null;
          Object.assign(alert, data);
          return alert;
        }),
      },
    },
  };
});

describe('Deal Health & Control Tower API (Developer B Phase B6)', () => {
  let adminToken: string;

  beforeEach(() => {
    adminToken = generateAccessToken({ sub: 'user-admin', email: 'admin@dealflow.com', role: 'ADMIN' });
  });

  it('retrieves control tower metrics, active deal alerts, and pipeline quotations', async () => {
    const res = await request(app)
      .get('/api/v1/control-tower')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.totalPipelineValue).toBeGreaterThan(0);
    expect(res.body.data.alerts).toBeDefined();
    expect(res.body.data.quotations).toBeDefined();
  });

  it('resolves an active deal alert successfully', async () => {
    const res = await request(app)
      .post('/api/v1/control-tower/alerts/alert-01/resolve')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isResolved).toBe(true);
  });
});
