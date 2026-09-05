import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const rulesMap = new Map<string, any>();
  const customersMap = new Map<string, any>();
  const productsMap = new Map<string, any>();

  // Seed baseline product in mock
  productsMap.set('prod-srv-9000', {
    id: 'prod-srv-9000',
    sku: 'SKU-SRV-9000',
    name: 'Enterprise Server Pro',
    category: 'Hardware',
    listPrice: 10000,
    standardCost: 6000,
    maxAllowedDiscount: 15.0,
    billingType: 'ONE_TIME',
    isActive: true,
  });

  return {
    CustomerTier: {
      ENTERPRISE: 'ENTERPRISE',
      GOLD: 'GOLD',
      SILVER: 'SILVER',
      BRONZE: 'BRONZE',
    },
    Role: {
      ADMIN: 'ADMIN',
      SALES_MANAGER: 'SALES_MANAGER',
      SALES_REP: 'SALES_REP',
      FINANCE_OPERATIONS: 'FINANCE_OPERATIONS',
      CUSTOMER: 'CUSTOMER',
    },
    db: {
      discountPolicyRule: {
        findMany: vi.fn(async ({ where }: { where?: any } = {}) => {
          let list = Array.from(rulesMap.values());
          if (where) {
            if (where.customerTier) list = list.filter((r) => r.customerTier === where.customerTier);
            if (where.isActive !== undefined) list = list.filter((r) => r.isActive === where.isActive);
          }
          return list;
        }),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => rulesMap.get(where.id) || null),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newRule = {
            id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: data.name,
            description: data.description || null,
            customerTier: data.customerTier || null,
            category: data.category || null,
            productId: data.productId || null,
            maxDiscountPercent: data.maxDiscountPercent,
            minMarginPercent: data.minMarginPercent ?? null,
            requiredApprovalRole: data.requiredApprovalRole || 'SALES_MANAGER',
            priority: data.priority ?? 10,
            isActive: data.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          rulesMap.set(newRule.id, newRule);
          return newRule;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = rulesMap.get(where.id);
          if (!existing) return null;
          const updated = { ...existing, ...data, updatedAt: new Date() };
          rulesMap.set(where.id, updated);
          return updated;
        }),
        delete: vi.fn(async ({ where }: { where: { id: string } }) => {
          rulesMap.delete(where.id);
          return { id: where.id };
        }),
      },
      customer: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => customersMap.get(where.id) || null),
      },
      product: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => productsMap.get(where.id) || null),
      },
      priceList: {
        findFirst: vi.fn(async () => null),
      },
    },
  };
});

describe('Discount Policy & Commercial Evaluation API (Module A3)', () => {
  let adminToken: string;
  let salesManagerToken: string;
  let salesRepToken: string;
  let customerToken: string;

  beforeEach(() => {
    adminToken = generateAccessToken({ sub: 'adm-1', email: 'admin@dealflow.com', role: 'ADMIN' });
    salesManagerToken = generateAccessToken({ sub: 'mgr-1', email: 'mgr@dealflow.com', role: 'SALES_MANAGER' });
    salesRepToken = generateAccessToken({ sub: 'rep-1', email: 'rep@dealflow.com', role: 'SALES_REP' });
    customerToken = generateAccessToken({ sub: 'cust-1', email: 'cust@dealflow.com', role: 'CUSTOMER' });
  });

  it('GET /api/v1/discount-policies returns policy list for authorized users', async () => {
    const res = await request(app)
      .get('/api/v1/discount-policies')
      .set('Authorization', `Bearer ${salesRepToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/discount-policies creates a new discount policy rule (ADMIN / SALES_MANAGER)', async () => {
    const res = await request(app)
      .post('/api/v1/discount-policies')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Enterprise Hardware Governance',
        description: 'Cap hardware discount at 15% for Enterprise tier',
        customerTier: 'ENTERPRISE',
        category: 'Hardware',
        maxDiscountPercent: 15.0,
        minMarginPercent: 25.0,
        requiredApprovalRole: 'SALES_MANAGER',
        priority: 50,
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Enterprise Hardware Governance');
    expect(res.body.data.customerTier).toBe('ENTERPRISE');
    expect(res.body.data.maxDiscountPercent).toBe(15.0);
  });

  it('PATCH /api/v1/discount-policies/:id updates policy metadata & toggles status', async () => {
    const createRes = await request(app)
      .post('/api/v1/discount-policies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Temporary Promo Policy',
        maxDiscountPercent: 20.0,
        priority: 10,
      });

    const ruleId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/discount-policies/${ruleId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isActive: false,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.isActive).toBe(false);
  });

  it('POST /api/v1/commercial-evaluations/evaluate evaluates deal scenario correctly', async () => {
    const evalRes = await request(app)
      .post('/api/v1/commercial-evaluations/evaluate')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        customerTier: 'ENTERPRISE',
        currency: 'USD',
        lines: [
          {
            productId: 'prod-srv-9000',
            quantity: 2,
            proposedDiscountPercent: 5.0,
          },
        ],
      });

    expect(evalRes.status).toBe(200);
    expect(evalRes.body.success).toBe(true);
    expect(evalRes.body.data.netTotal).toBe(19000);
    expect(evalRes.body.data.requiresApproval).toBe(false);
    expect(evalRes.body.data.riskLevel).toBe('LOW');
  });

  it('Forbids CUSTOMER role from managing discount policies (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/discount-policies')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Malicious Policy',
        maxDiscountPercent: 50.0,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
