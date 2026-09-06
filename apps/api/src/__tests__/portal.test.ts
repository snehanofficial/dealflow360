import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const tokensMap = new Map<string, any>();
  const quotesMap = new Map<string, any>();
  const counterOffersMap = new Map<string, any>();

  const defaultCustomer = {
    id: 'cust-portal-01',
    code: 'CUST-PORTAL-01',
    name: 'Portal Test Corp',
    tier: 'GOLD',
  };

  const defaultProduct = {
    id: 'prod-portal-01',
    sku: 'PROD-PORTAL-01',
    name: 'Enterprise License',
    category: 'Software',
    listPrice: 2000,
    standardCost: 1000,
    billingType: 'ONE_TIME',
  };

  const defaultQuote = {
    id: 'quote-portal-01',
    quoteNumber: 'QT-PORTAL-001',
    status: 'APPROVED',
    subtotal: 4000,
    totalDiscount: 400,
    netValue: 3600,
    grossMarginPercent: 44.44,
    riskScore: 1.0,
    riskLevel: 'LOW',
    customer: defaultCustomer,
    lines: [
      {
        id: 'line-portal-01',
        productId: defaultProduct.id,
        quantity: 2,
        listPrice: 2000,
        proposedDiscountPercent: 10,
        discountAmount: 400,
        netLinePrice: 3600,
        lineCost: 2000,
        lineMarginPercent: 44.44,
        product: defaultProduct,
      },
    ],
    counterOffers: [],
  };
  quotesMap.set(defaultQuote.id, defaultQuote);

  const activeToken = {
    id: 'ptk-01',
    token: 'valid-portal-token-123',
    quotationId: defaultQuote.id,
    quotation: defaultQuote,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isRevoked: false,
  };
  tokensMap.set(activeToken.token, activeToken);

  const revokedToken = {
    id: 'ptk-02',
    token: 'revoked-portal-token-456',
    quotationId: defaultQuote.id,
    quotation: defaultQuote,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isRevoked: true,
  };
  tokensMap.set(revokedToken.token, revokedToken);

  const dbMock: any = {
      portalToken: {
        findUnique: vi.fn(async ({ where }: { where: { token: string } }) => {
          const t = tokensMap.get(where.token);
          if (!t) return null;
          return {
            ...t,
            quotation: quotesMap.get(t.quotationId) || t.quotation,
          };
        }),

        create: vi.fn(async ({ data }: { data: any }) => {
          const newToken = {
            id: `ptk-${Date.now()}`,
            token: `token-${Date.now()}`,
            quotationId: data.quotationId,
            expiresAt: data.expiresAt,
            isRevoked: data.isRevoked || false,
          };
          tokensMap.set(newToken.token, newToken);
          return newToken;
        }),
      },
      quotation: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
          return quotesMap.get(where.id) || null;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const q = quotesMap.get(where.id);
          if (!q) return null;
          const updated = { ...q, ...data };
          quotesMap.set(where.id, updated);
          return updated;
        }),
      },
      quoteLine: {
        findMany: vi.fn(async ({ where }: { where: { quotationId: string } }) => {
          const q = quotesMap.get(where.quotationId);
          return q ? q.lines : [];
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          for (const q of quotesMap.values()) {
            const line = q.lines.find((l: any) => l.id === where.id);
            if (line) {
              Object.assign(line, data);
              return line;
            }
          }
          return null;
        }),
      },
      counterOffer: {
        create: vi.fn(async ({ data }: { data: any }) => {
          const newCo = {
            id: `co-${Date.now()}`,
            ...data,
            createdAt: new Date(),
          };
          counterOffersMap.set(newCo.id, newCo);
          const q = quotesMap.get(data.quotationId);
          if (q) {
            q.counterOffers.push(newCo);
          }
          return newCo;
        }),
      },
  };
  return { db: { ...dbMock, $transaction: async (cb: any) => cb(dbMock) } };
});


describe('Customer Negotiation Portal API (Developer B Phase B2)', () => {
  let repToken: string;

  beforeEach(() => {
    repToken = generateAccessToken({ sub: 'user-sales-01', email: 'rep@dealflow.com', role: 'SALES_REP' });
  });

  it('allows authenticated sales rep to generate a portal token', async () => {
    const res = await request(app)
      .post('/api/v1/portal/tokens')
      .set('Authorization', `Bearer ${repToken}`)
      .send({
        quotationId: 'quote-portal-01',
        expiresInHours: 48,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.portalUrl).toContain('/portal/quotes/');
  });

  it('allows customer to view sanitized quote using valid portal token without login', async () => {
    const res = await request(app).get('/api/v1/portal/quotes/valid-portal-token-123');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quoteNumber).toBe('QT-PORTAL-001');
    expect(res.body.data.customer.name).toBe('Portal Test Corp');
    expect(res.body.data.lines).toHaveLength(1);
    // Verify standardCost is not exposed in public customer portal response
    expect((res.body.data.lines[0] as any).lineCost).toBeUndefined();
  });

  it('returns 401 when accessing portal with a revoked token', async () => {
    const res = await request(app).get('/api/v1/portal/quotes/revoked-portal-token-456');

    expect(res.status).toBe(401);
  });

  it('submits a customer counteroffer and recalculates quote state', async () => {
    const res = await request(app)
      .post('/api/v1/portal/quotes/valid-portal-token-123/counter-offer')
      .send({
        proposedDiscountPercent: 20,
        customerNotes: 'We request 20% discount for multi-year commitment.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING_MANAGER');
    expect(res.body.data.counterOffers).toHaveLength(1);

    expect(res.body.data.counterOffers[0].proposedDiscountPercent).toBe(20);
  });
});
