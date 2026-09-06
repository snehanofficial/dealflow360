import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

// Mock DB client calls for quotation testing
vi.mock('@dealflow360/db', () => {
  const quotesMap = new Map<string, any>();
  const customersMap = new Map<string, any>();
  const productsMap = new Map<string, any>();

  // Pre-seed a customer & product
  const defaultCustomer = {
    id: 'cust-001',
    code: 'CUST-001',
    name: 'Acme Corp',
    email: 'acme@example.com',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
  };
  customersMap.set(defaultCustomer.id, defaultCustomer);

  const defaultProduct = {
    id: 'prod-001',
    sku: 'PROD-001',
    name: 'Enterprise Cloud License',
    category: 'Software',
    listPrice: 1000,
    standardCost: 500,
    billingType: 'ONE_TIME',
    isActive: true,
  };
  productsMap.set(defaultProduct.id, defaultProduct);

  const dbMock: any = {
      user: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => ({ id: where.id, email: 'rep@dealflow.com', name: 'Sales Rep' })),
        findFirst: vi.fn(async () => ({ id: 'user-rep-01', email: 'rep@dealflow.com', name: 'Sales Rep' })),
      },
      customer: {

        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
          return customersMap.get(where.id) || null;
        }),
      },
      product: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
          return productsMap.get(where.id) || null;
        }),
      },
      quotation: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
          return quotesMap.get(where.id) || null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newQuote = {
            id: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            quoteNumber: data.quoteNumber || `QT-${Date.now()}`,
            customerId: data.customerId,
            customer: customersMap.get(data.customerId) || defaultCustomer,
            createdById: data.createdById || 'user-rep',
            status: data.status || 'DRAFT',
            subtotal: data.subtotal || 0,
            totalDiscount: data.totalDiscount || 0,
            netValue: data.netValue || 0,
            grossMarginPercent: data.grossMarginPercent || 0,
            riskScore: data.riskScore || 1.0,
            riskLevel: data.riskLevel || 'LOW',
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [],
          };
          quotesMap.set(newQuote.id, newQuote);
          return newQuote;
        }),
        findMany: vi.fn(async ({ skip = 0, take = 20 }: { skip?: number; take?: number }) => {
          const list = Array.from(quotesMap.values());
          return list.slice(skip, skip + take);
        }),
        count: vi.fn(async () => quotesMap.size),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = quotesMap.get(where.id);
          if (!existing) return null;
          const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
          };
          quotesMap.set(where.id, updated);
          return updated;
        }),
      },
      quoteLine: {
        findMany: vi.fn(async ({ where }: { where: { quotationId: string } }) => {
          const q = quotesMap.get(where.quotationId);
          return q ? q.lines : [];
        }),
        findFirst: vi.fn(async ({ where }: { where: { id: string; quotationId: string } }) => {
          const q = quotesMap.get(where.quotationId);
          if (!q) return null;
          const line = q.lines.find((l: any) => l.id === where.id);
          if (!line) return null;
          return { ...line, product: defaultProduct };
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const q = quotesMap.get(data.quotationId);
          const newLine = {
            id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            ...data,
            product: productsMap.get(data.productId) || defaultProduct,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          if (q) {
            q.lines.push(newLine);
          }
          return newLine;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          for (const q of quotesMap.values()) {
            const index = q.lines.findIndex((l: any) => l.id === where.id);
            if (index !== -1) {
              q.lines[index] = { ...q.lines[index], ...data, updatedAt: new Date() };
              return q.lines[index];
            }
          }
          return null;
        }),
        delete: vi.fn(async ({ where }: { where: { id: string } }) => {
          for (const q of quotesMap.values()) {
            const index = q.lines.findIndex((l: any) => l.id === where.id);
            if (index !== -1) {
              const deleted = q.lines.splice(index, 1)[0];
              return deleted;
            }
          }
          return null;
        }),
      },
    },
  };
});

describe('Quotation Management API (Developer B Phase B1)', () => {
  let token: string;

  beforeEach(() => {
    token = generateAccessToken({ sub: 'user-rep-01', email: 'rep@dealflow.com', role: 'SALES_REP' });
  });

  it('creates a new quotation successfully', async () => {
    const res = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: 'cust-001',
        quoteNumber: 'QT-TEST-2026-001',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quoteNumber).toBe('QT-TEST-2026-001');
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('lists quotations with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('adds a line item and updates totals and risk', async () => {
    const createRes = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: 'cust-001',
        quoteNumber: 'QT-TEST-LINE-001',
      });

    const quoteId = createRes.body.data.id;

    const lineRes = await request(app)
      .post(`/api/v1/quotes/${quoteId}/lines`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 'prod-001',
        quantity: 5,
        proposedDiscountPercent: 10,
      });

    expect(lineRes.status).toBe(201);
    expect(lineRes.body.data.lines).toHaveLength(1);
    expect(lineRes.body.data.subtotal).toBe(5000);
    expect(lineRes.body.data.netValue).toBe(4500);
  });

  it('submits a low-risk quote to APPROVED state', async () => {
    const createRes = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: 'cust-001',
        quoteNumber: 'QT-SUBMIT-LOW',
      });

    const quoteId = createRes.body.data.id;

    await request(app)
      .post(`/api/v1/quotes/${quoteId}/lines`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 'prod-001',
        quantity: 2,
        proposedDiscountPercent: 5,
      });

    const submitRes = await request(app)
      .post(`/api/v1/quotes/${quoteId}/submit`)
      .set('Authorization', `Bearer ${token}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.status).toBe('APPROVED');
  });

  it('allows adding line item with higher edited unitPrice than product list price', async () => {
    const createRes = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: 'cust-001',
        quoteNumber: 'QT-TEST-HIGHER-PRICE',
      });

    const quoteId = createRes.body.data.id;

    const lineRes = await request(app)
      .post(`/api/v1/quotes/${quoteId}/lines`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 'prod-001',
        quantity: 2,
        unitPrice: 1500, // higher than default list price 1000
        proposedDiscountPercent: 10,
      });

    expect(lineRes.status).toBe(201);
    expect(lineRes.body.data.subtotal).toBe(3000); // 1500 * 2
    expect(lineRes.body.data.totalDiscount).toBe(300); // 3000 * 10%
    expect(lineRes.body.data.netValue).toBe(2700);
  });
});
