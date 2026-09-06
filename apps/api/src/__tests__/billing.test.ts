import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const quotesMap = new Map<string, any>();
  const billingSchedulesMap = new Map<string, any>();

  const customer1 = { id: 'cust-bill-01', name: 'Subscription Enterprise', code: 'CUST-BILL' };
  const prodOneTime = {
    id: 'prod-ot-01',
    sku: 'PROD-HW-01',
    name: 'Datacenter Server Unit',
    billingType: 'ONE_TIME',
    recurringPeriod: null,
  };
  const prodRecurring = {
    id: 'prod-rec-01',
    sku: 'PROD-SAAS-01',
    name: 'Enterprise Cloud License',
    billingType: 'RECURRING',
    recurringPeriod: 'MONTHLY',
  };

  const defaultQuote = {
    id: 'quote-bill-01',
    quoteNumber: 'QT-BILL-001',
    status: 'APPROVED',
    customerId: customer1.id,
    customer: customer1,
    lines: [
      {
        id: 'line-bill-01',
        productId: prodOneTime.id,
        quantity: 2,
        listPrice: 5000,
        netLinePrice: 10000,
        product: prodOneTime,
      },
      {
        id: 'line-bill-02',
        productId: prodRecurring.id,
        quantity: 10,
        listPrice: 150,
        netLinePrice: 1500,
        product: prodRecurring,
      },
    ],
    billingSchedule: null,
  };

  quotesMap.set(defaultQuote.id, defaultQuote);

  const dbMock: any = {
      quotation: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => quotesMap.get(where.id) || null),
        findMany: vi.fn(async () => Array.from(quotesMap.values())),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const q = quotesMap.get(where.id);
          if (!q) return null;
          Object.assign(q, data);
          return q;
        }),
      },
      billingSchedule: {
        delete: vi.fn(async ({ where }: { where: { id: string } }) => {
          billingSchedulesMap.delete(where.id);
          return { id: where.id };
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newSched = {
            id: `sched-${Date.now()}`,
            ...data,
            lines: data.lines?.create || [],
          };
          billingSchedulesMap.set(newSched.id, newSched);
          const q = quotesMap.get(data.quotationId);
          if (q) q.billingSchedule = newSched;
          return newSched;
        }),
      },
  };
  return { db: { ...dbMock, $transaction: async (cb: any) => cb(dbMock) } };
});


describe('Subscription & Hybrid Billing API (Developer B Phase B4)', () => {
  let token: string;

  beforeEach(() => {
    token = generateAccessToken({ sub: 'user-finance-ops', email: 'finance@dealflow.com', role: 'FINANCE_OPERATIONS' });
  });

  it('fetches universal billing schedules list across deals', async () => {
    const res = await request(app)
      .get('/api/v1/billing')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('computes hybrid billing schedule for quote containing one-time and recurring lines', async () => {
    const res = await request(app)
      .get('/api/v1/quotes/quote-bill-01/billing')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.computedSchedule.totalOneTimeAmount).toBe(10000);
    expect(res.body.data.computedSchedule.totalRecurringMonthly).toBe(1500);
    expect(res.body.data.computedSchedule.lines).toBeDefined();
  });

  it('generates, persists, and locks hybrid billing schedule, updating quote status to BILLING', async () => {
    const res = await request(app)
      .post('/api/v1/quotes/quote-bill-01/billing/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ billingStartDate: '2026-02-01T00:00:00.000Z' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.billingSchedule.totalOneTimeAmount).toBe(10000);
    expect(res.body.data.billingSchedule.totalRecurringMonthly).toBe(1500);
    expect(res.body.data.billingSchedule.lines.length).toBeGreaterThan(0);
  });
});

