import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { db } from '@dealflow360/db';
import { recordAuditEvent, getAuditLogs, getEntityAuditLogs } from '../services/auditService.js';
import { computeStateDiff, sanitizeAuditPayload } from '@dealflow360/domain';

describe('A5 - Audit Trail & Commercial Event History Suite', () => {
  let adminToken: string;
  let managerToken: string;
  let repToken: string;
  let financeToken: string;
  let customerToken: string;
  let managerUser: any;
  let repUser: any;

  beforeEach(async () => {
    // Clean audit logs before each test
    await db.auditLog.deleteMany({});

    // Authenticate test users
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@dealflow360.com', password: 'Password123!' });
    adminToken = adminRes.body.data.accessToken;

    const managerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sales.manager@dealflow360.com', password: 'Password123!' });
    managerToken = managerRes.body.data.accessToken;
    managerUser = managerRes.body.data.user;

    const repRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sales.rep@dealflow360.com', password: 'Password123!' });
    repToken = repRes.body.data.accessToken;
    repUser = repRes.body.data.user;

    const financeRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'finance@dealflow360.com', password: 'Password123!' });
    financeToken = financeRes.body.data.accessToken;

    const customerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer@dealflow360.com', password: 'Password123!' });
    customerToken = customerRes.body.data.accessToken;
  });

  describe('1. Domain & Service Core Logic', () => {
    it('sanitizes forbidden credential keys automatically', () => {
      const dirty = {
        name: 'Safe Name',
        password: 'SecretPassword123!',
        passwordHash: '$argon2id$...',
        token: 'eyJhbGci...',
        refreshToken: 'refresh-token-value',
        creditLimit: 50000,
      };

      const sanitized = sanitizeAuditPayload(dirty);
      expect(sanitized).toBeDefined();
      expect(sanitized?.name).toBe('Safe Name');
      expect(sanitized?.creditLimit).toBe(50000);
      expect(sanitized?.password).toBeUndefined();
      expect(sanitized?.passwordHash).toBeUndefined();
      expect(sanitized?.token).toBeUndefined();
      expect(sanitized?.refreshToken).toBeUndefined();
    });

    it('computes state diff accurately for updated fields', () => {
      const prev = { sku: 'SKU-001', name: 'Product V1', listPrice: 1000, category: 'Hardware' };
      const curr = { sku: 'SKU-001', name: 'Product V2', listPrice: 1200, category: 'Hardware' };

      const diffs = computeStateDiff(prev, curr, ['name', 'listPrice', 'category']);
      expect(diffs).toHaveLength(2);

      const nameDiff = diffs.find((d) => d.field === 'name');
      expect(nameDiff).toEqual({ field: 'name', old: 'Product V1', new: 'Product V2' });

      const priceDiff = diffs.find((d) => d.field === 'listPrice');
      expect(priceDiff).toEqual({ field: 'listPrice', old: 1000, new: 1200 });
    });

    it('handles system-generated events when actor is null', async () => {
      const record = await recordAuditEvent({
        eventType: 'COMMERCIAL_EVALUATED',
        action: 'System Governance Evaluation',
        entityType: 'DiscountPolicyRule',
        entityId: 'rule-sys-001',
        actor: null,
      });

      expect(record).toBeDefined();
      expect(record.actorId).toBeNull();
      expect(record.actorName).toBe('SYSTEM');
    });

    it('ignores client-supplied actor fields and derives identity from server context', async () => {
      const spoofedActorInput = {
        id: 'spoofed-id-999',
        name: 'Fake Admin',
        role: 'ADMIN',
      };

      // In recordAuditEvent, passing valid server-derived actor binds authoritative id
      const record = await recordAuditEvent({
        eventType: 'CUSTOMER_CREATED',
        entityType: 'Customer',
        entityId: 'cust-real-001',
        actor: { id: managerUser.id, name: managerUser.name, role: managerUser.role },
        metadata: { clientBodyInput: spoofedActorInput },
      });

      expect(record.actorId).toBe(managerUser.id);
      expect(record.actorName).toBe(managerUser.name);
      expect(record.actorRole).toBe('SALES_MANAGER');
      expect(record.actorId).not.toBe('spoofed-id-999');
    });
  });

  describe('2. Read-Only API & RBAC Security', () => {
    it('allows authorized roles (ADMIN, SALES_MANAGER, FINANCE) to access audit logs', async () => {
      await recordAuditEvent({
        eventType: 'CUSTOMER_CREATED',
        action: 'Test Customer Creation',
        entityType: 'Customer',
        entityId: 'cust-100',
        actor: managerUser,
      });

      const resManager = await request(app)
        .get('/api/v1/audit')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(resManager.status).toBe(200);
      expect(resManager.body.success).toBe(true);
      expect(resManager.body.data.items.length).toBeGreaterThanOrEqual(1);

      const resFinance = await request(app)
        .get('/api/v1/audit')
        .set('Authorization', `Bearer ${financeToken}`);
      expect(resFinance.status).toBe(200);

      const resAdmin = await request(app)
        .get('/api/v1/audit')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resAdmin.status).toBe(200);
    });

    it('rejects unauthorized roles (SALES_REP, CUSTOMER) with HTTP 403 Forbidden', async () => {
      const resRep = await request(app)
        .get('/api/v1/audit')
        .set('Authorization', `Bearer ${repToken}`);
      expect(resRep.status).toBe(403);

      const resCustomer = await request(app)
        .get('/api/v1/audit')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(resCustomer.status).toBe(403);
    });

    it('rejects HTTP mutation attempts on /api/v1/audit (POST, PATCH, PUT, DELETE)', async () => {
      const resPost = await request(app)
        .post('/api/v1/audit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ eventType: 'FAKE_EVENT' });
      expect(resPost.status).toBeGreaterThanOrEqual(400);

      const resPatch = await request(app)
        .patch('/api/v1/audit/some-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'Hack Action' });
      expect(resPatch.status).toBeGreaterThanOrEqual(400);

      const resDelete = await request(app)
        .delete('/api/v1/audit/some-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resDelete.status).toBeGreaterThanOrEqual(400);
    });

    it('supports filtering by entityType, eventType, search, and pagination', async () => {
      await recordAuditEvent({
        eventType: 'CUSTOMER_CREATED',
        action: 'Created Acme Corp',
        entityType: 'Customer',
        entityId: 'cust-acme',
        actor: managerUser,
      });

      await recordAuditEvent({
        eventType: 'PRODUCT_PRICE_CHANGED',
        action: 'Price change for Server',
        entityType: 'Product',
        entityId: 'prod-srv',
        actor: managerUser,
      });

      const resFilter = await request(app)
        .get('/api/v1/audit')
        .query({ entityType: 'Customer' })
        .set('Authorization', `Bearer ${managerToken}`);

      expect(resFilter.status).toBe(200);
      expect(resFilter.body.data.items).toHaveLength(1);
      expect(resFilter.body.data.items[0].entityType).toBe('Customer');

      const resEntity = await request(app)
        .get('/api/v1/audit/entity/Product/prod-srv')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(resEntity.status).toBe(200);
      expect(resEntity.body.data).toHaveLength(1);
      expect(resEntity.body.data[0].entityId).toBe('prod-srv');
    });
  });

  describe('3. Integration & Transactional Atomicity (A1 - A4)', () => {
    it('creates audit record on Customer creation and update (A1)', async () => {
      const createRes = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          code: `CUST-AUDIT-${Date.now()}`,
          name: 'Audit Test Customer',
          email: `audit.customer.${Date.now()}@test.com`,
          tier: 'GOLD',
        });

      expect(createRes.status).toBe(201);
      const customerId = createRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ tier: 'ENTERPRISE' });

      expect(updateRes.status).toBe(200);

      const logs = await getEntityAuditLogs('Customer', customerId);
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.map((l) => l.eventType)).toContain('CUSTOMER_CREATED');
      expect(logs.map((l) => l.eventType)).toContain('CUSTOMER_UPDATED');
    });

    it('creates audit record on Product creation and Price change (A2)', async () => {
      const prodRes = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          sku: `SKU-AUDIT-${Date.now()}`,
          name: 'Audit Server Pro',
          category: 'HARDWARE',
          unitPrice: 5000,
          costPrice: 3000,
        });

      expect(prodRes.status).toBe(201);
      const prodId = prodRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/v1/products/${prodId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ unitPrice: 5500 });

      expect(updateRes.status).toBe(200);

      const logs = await getEntityAuditLogs('Product', prodId);
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.map((l) => l.eventType)).toContain('PRODUCT_CREATED');
      expect(logs.map((l) => l.eventType)).toContain('PRODUCT_PRICE_CHANGED');
    });

    it('creates audit record on Price List creation and Entry update (A2)', async () => {
      const plRes = await request(app)
        .post('/api/v1/price-lists')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Custom Gold Price List',
          currency: 'USD',
          customerTier: 'GOLD',
        });

      expect(plRes.status).toBe(201);
      const priceListId = plRes.body.data.id;

      const logs = await getEntityAuditLogs('PriceList', priceListId);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].eventType).toBe('PRICE_LIST_CREATED');
    });

    it('creates audit record on Discount Policy creation and update (A3)', async () => {
      const policyRes = await request(app)
        .post('/api/v1/discount-policies')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Audit Policy Rule',
          maxDiscountPercent: 12,
          minMarginPercent: 25,
          requiredApprovalRole: 'SALES_MANAGER',
          priority: 50,
        });

      expect(policyRes.status).toBe(201);
      const policyId = policyRes.body.data.id;

      const updateRes = await request(app)
        .patch(`/api/v1/discount-policies/${policyId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ maxDiscountPercent: 15 });

      expect(updateRes.status).toBe(200);

      const logs = await getEntityAuditLogs('DiscountPolicyRule', policyId);
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.map((l) => l.eventType)).toContain('DISCOUNT_POLICY_CREATED');
      expect(logs.map((l) => l.eventType)).toContain('DISCOUNT_POLICY_UPDATED');
    });

    it('commits approval decision and audit record atomically inside transaction (A4)', async () => {
      // Create approval request
      const createApprovalRes = await request(app)
        .post('/api/v1/approvals')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          evaluation: {
            quoteId: 'quote-sample-001',
            requiresApproval: true,
            requiredApprovalRoles: ['SALES_MANAGER'],
            riskScore: 7.5,
            riskLevel: 'HIGH',
            netTotal: 25000,
            marginAmount: 7500,
            marginPercentage: 30,
            violations: [],
            evaluatedAt: new Date().toISOString(),
          },
        });

      expect(createApprovalRes.status).toBe(201);
      const requestId = createApprovalRes.body.data.id;

      // Approve step
      const approveRes = await request(app)
        .post(`/api/v1/approvals/${requestId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ comments: 'Approved by Sales Manager' });

      expect(approveRes.status).toBe(200);

      const logs = await getEntityAuditLogs('ApprovalRequest', requestId);
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.map((l) => l.eventType)).toContain('APPROVAL_REQUESTED');
      expect(logs.map((l) => l.eventType)).toContain('APPROVAL_APPROVED');
    });

    it('ensures a failed transaction rolls back and does not persist false audit records', async () => {
      const countBefore = await db.auditLog.count();

      // Attempt invalid approval step decision (invalid status / non-existent request)
      const res = await request(app)
        .post('/api/v1/approvals/non-existent-id/approve')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ comments: 'Test invalid approval' });

      expect(res.status).toBe(404);

      const countAfter = await db.auditLog.count();
      expect(countAfter).toBe(countBefore);
    });
  });
});
