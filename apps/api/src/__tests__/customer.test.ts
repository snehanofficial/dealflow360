import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

// Mock DB client calls
vi.mock('@dealflow360/db', () => {
  const customersMap = new Map<string, any>();

  return {
    db: {
      customer: {
        findUnique: vi.fn(async ({ where }: { where: { code?: string; id?: string } }) => {
          if (where.code) {
            for (const c of customersMap.values()) {
              if (c.code === where.code) return c;
            }
            return null;
          }
          if (where.id) {
            return customersMap.get(where.id) || null;
          }
          return null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newCustomer = {
            id: `cust-${Date.now()}`,
            code: data.code,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            tier: data.tier || 'TIER_2',
            status: data.status || 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          customersMap.set(newCustomer.id, newCustomer);
          return newCustomer;
        }),
        findMany: vi.fn(async ({ take }: { take?: number }) => {
          const list = Array.from(customersMap.values());
          return take ? list.slice(0, take) : list;
        }),
        count: vi.fn(async () => customersMap.size),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = customersMap.get(where.id);
          if (!existing) return null;
          const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
          };
          customersMap.set(where.id, updated);
          return updated;
        }),
      },
    },
  };
});

describe('Customer Management API (Developer A Phase 1)', () => {
  let salesRepToken: string;
  let salesManagerToken: string;
  let customerToken: string;

  beforeEach(() => {
    salesRepToken = generateAccessToken({ sub: 'user-sales-rep', email: 'rep@dealflow.com', role: 'SALES_REP' });
    salesManagerToken = generateAccessToken({ sub: 'user-manager', email: 'manager@dealflow.com', role: 'SALES_MANAGER' });
    customerToken = generateAccessToken({ sub: 'user-cust', email: 'customer@acme.com', role: 'CUSTOMER' });
  });

  it('AC-1: allows Sales Rep to create a valid customer account', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        code: 'CUST-TEST-001',
        name: 'Test Enterprise Corp',
        email: 'billing@testcorp.com',
        phone: '+1 555-0199',
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('CUST-TEST-001');
    expect(res.body.data.tier).toBe('ENTERPRISE');
  });

  it('AC-2: returns paginated list of customers on GET /api/v1/customers', async () => {
    const res = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${salesRepToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
  });

  it('AC-3: returns 409 conflict when creating customer with duplicate code', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${salesRepToken}`)
      .send({
        code: 'CUST-TEST-001',
        name: 'Duplicate Inc',
        email: 'dup@testcorp.com',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_CODE');
  });

  it('AC-4: denies customer creation for unauthorized CUSTOMER role (403)', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        code: 'CUST-UNAUTH',
        name: 'Unauthorized Inc',
        email: 'unauth@test.com',
      });

    expect(res.status).toBe(403);
  });

  it('AC-5: allows Sales Manager to update customer status to SUSPENDED', async () => {
    // First create a customer
    const createRes = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        code: 'CUST-[#714B67]',
        name: 'Acme Suspended Ltd',
        email: 'info@acmesusp.com',
      });

    const customerId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/customers/${customerId}`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        status: 'SUSPENDED',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('SUSPENDED');
  });
});
