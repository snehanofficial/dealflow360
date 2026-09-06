import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  return {
    Role: {
      ADMIN: 'ADMIN',
      SALES_MANAGER: 'SALES_MANAGER',
      SALES_REP: 'SALES_REP',
      FINANCE_OPERATIONS: 'FINANCE_OPERATIONS',
      CUSTOMER: 'CUSTOMER',
    },
    db: {
      quotation: {
        count: vi.fn(async () => 12),
        aggregate: vi.fn(async () => ({ _sum: { netValue: 240000 } })),
        groupBy: vi.fn(async () => [
          { status: 'DRAFT', _count: 4, _sum: { netValue: 40000 } },
          { status: 'PENDING_MANAGER', _count: 3, _sum: { netValue: 60000 } },
          { status: 'APPROVED', _count: 5, _sum: { netValue: 140000 } },
        ]),
        findMany: vi.fn(async () => [
          {
            id: 'qt-101',
            quoteNumber: 'QT-2026-0001',
            netValue: 120000,
            riskLevel: 'LOW',
            status: 'APPROVED',
            updatedAt: new Date(),
            customer: { id: 'cust-1', name: 'Acme Corp' },
          },
        ]),
      },
      approvalRequest: {
        count: vi.fn(async () => 2),
        findMany: vi.fn(async () => [
          {
            id: 'app-1',
            netTotal: 150000,
            createdAt: new Date(),
            quotation: { quoteNumber: 'QT-2026-0002', customer: { name: 'Innotech' } },
          },
        ]),
      },
      approvalStep: {
        count: vi.fn(async () => 1),
      },
      fulfillmentAllocation: {
        count: vi.fn(async () => 5),
      },
      inventoryItem: {
        count: vi.fn(async () => 2),
      },
      invoice: {
        count: vi.fn(async () => 3),
        aggregate: vi.fn(async () => ({ _sum: { totalAmount: 95000 } })),
        findMany: vi.fn(async () => []),
      },
      counterOffer: {
        count: vi.fn(async () => 1),
        findMany: vi.fn(async () => []),
      },
      user: {
        findFirst: vi.fn(async () => ({
          id: 'usr-cust-1',
          email: 'customer@dealflow360.com',
          customerId: 'cust-acme-001',
          customer: { id: 'cust-acme-001', name: 'Acme Enterprise Solutions' },
        })),
        findUnique: vi.fn(async () => ({
          id: 'usr-cust-1',
          email: 'customer@dealflow360.com',
          customerId: 'cust-acme-001',
          customer: { id: 'cust-acme-001', name: 'Acme Enterprise Solutions' },
        })),
      },
      customer: {
        findFirst: vi.fn(async () => ({
          id: 'cust-acme-001',
          name: 'Acme Enterprise Solutions',
          email: 'customer@dealflow360.com',
        })),
        findUnique: vi.fn(async () => ({
          id: 'cust-acme-001',
          name: 'Acme Enterprise Solutions',
          email: 'customer@dealflow360.com',
        })),
      },
      auditLog: {
        findMany: vi.fn(async () => [
          {
            id: 'log-1',
            eventType: 'QUOTATION_CREATED',
            action: 'Created quotation QT-2026-0001',
            actorName: 'System Admin',
            createdAt: new Date(),
          },
        ]),
      },
    },
  };
});

describe('Dashboard Endpoint (GET /api/v1/dashboard)', () => {
  it('should return 401 Unauthorized if no Bearer token is provided', async () => {
    const res = await request(app).get('/api/v1/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return ADMIN dashboard data for system admin user', async () => {
    const token = generateAccessToken({
      sub: 'usr-admin-1',
      email: 'admin@dealflow360.com',
      role: 'ADMIN',
    });

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
    expect(res.body.data.kpis).toHaveLength(5);
    expect(res.body.data.kpis[0].label).toBe('Total Quotations');
    expect(res.body.data.pipeline).toBeDefined();
    expect(res.body.data.recentQuotations).toHaveLength(1);
    expect(res.body.data.recentActivity).toBeDefined();
  });

  it('should return SALES_MANAGER dashboard data for sales manager user', async () => {
    const token = generateAccessToken({
      sub: 'usr-mgr-1',
      email: 'sales.manager@dealflow360.com',
      role: 'SALES_MANAGER',
    });

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('SALES_MANAGER');
    expect(res.body.data.kpis[0].label).toBe('Team Quotations');
  });

  it('should return SALES_REP dashboard data for sales rep user', async () => {
    const token = generateAccessToken({
      sub: 'usr-rep-1',
      email: 'sales.rep@dealflow360.com',
      role: 'SALES_REP',
    });

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('SALES_REP');
    expect(res.body.data.kpis[0].label).toBe('My Quotations');
  });

  it('should return FINANCE_OPERATIONS dashboard data for finance user', async () => {
    const token = generateAccessToken({
      sub: 'usr-fin-1',
      email: 'finance@dealflow360.com',
      role: 'FINANCE_OPERATIONS',
    });

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('FINANCE_OPERATIONS');
    expect(res.body.data.kpis[0].label).toBe('Orders to Fulfill');
  });

  it('should return CUSTOMER dashboard data for customer user', async () => {
    const token = generateAccessToken({
      sub: 'usr-cust-1',
      email: 'customer@dealflow360.com',
      role: 'CUSTOMER',
    });

    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('CUSTOMER');
    expect(res.body.data.kpis[0].label).toBe('My Quotations');
  });

  it('should ignore client query parameters attempting role escalation', async () => {
    const token = generateAccessToken({
      sub: 'usr-rep-1',
      email: 'sales.rep@dealflow360.com',
      role: 'SALES_REP',
    });

    const res = await request(app)
      .get('/api/v1/dashboard?role=ADMIN&customerId=other')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('SALES_REP');
  });
});
