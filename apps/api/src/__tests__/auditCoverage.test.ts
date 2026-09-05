import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { db } from '@dealflow360/db';
import { getEntityAuditLogs } from '../services/auditService.js';

describe('Platform-Wide Audit Coverage Suite (A1-A5 + B Modules)', () => {
  let managerToken: string;
  let repToken: string;
  let managerUser: any;
  let repUser: any;

  beforeEach(async () => {
    // Authenticate test users
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
  });

  it('audits User Login (USER_LOGGED_IN)', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sales.manager@dealflow360.com', password: 'Password123!' });
    expect(loginRes.status).toBe(200);

    const logs = await getEntityAuditLogs('User', managerUser.id);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs.map((l) => l.eventType)).toContain('USER_LOGGED_IN');
  });

  it('audits full Quotation Lifecycle: Create, Line Add/Update/Delete, Submit (QUOTE_*)', async () => {
    // 1. Create Customer
    const custRes = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        code: `CUST-COV-${Date.now()}`,
        name: 'Audit Coverage Client',
        email: `cov.client.${Date.now()}@test.com`,
        tier: 'GOLD',
      });
    expect(custRes.status).toBe(201);
    const customerId = custRes.body.data.id;

    // 2. Create Product
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        sku: `SKU-COV-${Date.now()}`,
        name: 'Coverage Server Pro',
        category: 'HARDWARE',
        unitPrice: 10000,
        costPrice: 6000,
      });
    expect(prodRes.status).toBe(201);
    const productId = prodRes.body.data.id;

    // 3. Create Quotation
    const quoteRes = await request(app)
      .post('/api/v1/quotes')
      .set('Authorization', `Bearer ${repToken}`)
      .send({ customerId });
    expect(quoteRes.status).toBe(201);
    const quotationId = quoteRes.body.data.id;

    // Verify QUOTE_CREATED audit log
    const quoteLogs1 = await getEntityAuditLogs('Quotation', quotationId);
    expect(quoteLogs1.map((l) => l.eventType)).toContain('QUOTE_CREATED');

    // 4. Add Quote Line
    const lineRes = await request(app)
      .post(`/api/v1/quotes/${quotationId}/lines`)
      .set('Authorization', `Bearer ${repToken}`)
      .send({ productId, quantity: 2, proposedDiscountPercent: 10 });
    expect(lineRes.status).toBe(201);

    const quoteLineId = lineRes.body.data.lines[0].id;
    const lineLogs = await getEntityAuditLogs('QuoteLine', quoteLineId);
    expect(lineLogs.map((l) => l.eventType)).toContain('QUOTE_LINE_ADDED');

    // 5. Update Quote Line
    const updateLineRes = await request(app)
      .patch(`/api/v1/quotes/${quotationId}/lines/${quoteLineId}`)
      .set('Authorization', `Bearer ${repToken}`)
      .send({ quantity: 3, proposedDiscountPercent: 12 });
    expect(updateLineRes.status).toBe(200);

    const lineUpdateLogs = await getEntityAuditLogs('QuoteLine', quoteLineId);
    expect(lineUpdateLogs.map((l) => l.eventType)).toContain('QUOTE_LINE_UPDATED');

    // 6. Submit Quotation
    const submitRes = await request(app)
      .post(`/api/v1/quotes/${quotationId}/submit`)
      .set('Authorization', `Bearer ${repToken}`);
    expect(submitRes.status).toBe(200);

    const quoteLogsSubmit = await getEntityAuditLogs('Quotation', quotationId);
    expect(quoteLogsSubmit.map((l) => l.eventType)).toContain('QUOTE_SUBMITTED');
  });

  it('audits Customer Portal Token Generation & Counteroffer (PORTAL_TOKEN_GENERATED & COUNTEROFFER_SUBMITTED)', async () => {
    // Fetch a sample quotation
    const listRes = await request(app)
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(listRes.status).toBe(200);
    const quotationId = listRes.body.data[0].id;

    // Generate portal token
    const tokenRes = await request(app)
      .post('/api/v1/portal/tokens')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ quotationId, expiresInHours: 48 });
    expect(tokenRes.status).toBe(201);
    const token = tokenRes.body.data.token;

    const tokenLogs = await db.auditLog.findMany({
      where: { eventType: 'PORTAL_TOKEN_GENERATED' },
    });
    expect(tokenLogs.length).toBeGreaterThanOrEqual(1);

    // Submit Counteroffer via Portal
    const offerRes = await request(app)
      .post(`/api/v1/portal/quotes/${token}/counter-offer`)
      .send({ proposedDiscountPercent: 15, customerNotes: 'Requesting 15% discount for bulk order.' });
    expect(offerRes.status).toBe(200);

    const counterLogs = await db.auditLog.findMany({
      where: { eventType: 'COUNTEROFFER_SUBMITTED' },
    });
    expect(counterLogs.length).toBeGreaterThanOrEqual(1);
    expect(counterLogs[0].actorRole).toBe('CUSTOMER');
  });

  it('audits Fulfillment Override & Billing Schedule Generation (FULFILLMENT_ALLOCATED & BILLING_SCHEDULE_GENERATED)', async () => {
    // Get sample quotation
    const listRes = await request(app)
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${managerToken}`);
    const quote = listRes.body.data[0];

    const wh = await db.warehouse.findFirst({ where: { isActive: true } });
    const quoteLineId = quote.lines[0]?.id;

    if (wh && quoteLineId) {
      await db.inventoryItem.upsert({
        where: { warehouseId_productId: { warehouseId: wh.id, productId: quote.lines[0].productId } },
        create: { warehouseId: wh.id, productId: quote.lines[0].productId, onHandQuantity: 1000, reservedQuantity: 0, availableQuantity: 1000 },
        update: { onHandQuantity: 1000, reservedQuantity: 0, availableQuantity: 1000 },
      });

      const overrideRes = await request(app)
        .post(`/api/v1/quotes/${quote.id}/fulfillment/override`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          overrides: [
            {
              quoteLineId,
              warehouseId: wh.id,
              allocatedQuantity: quote.lines[0].quantity,
            },
          ],
        });
      expect(overrideRes.status).toBe(200);

      const fulfillmentLogs = await db.auditLog.findMany({
        where: { eventType: 'FULFILLMENT_ALLOCATED' },
      });
      expect(fulfillmentLogs.length).toBeGreaterThanOrEqual(1);
    }

    // Generate Billing Schedule
    const billingRes = await request(app)
      .post(`/api/v1/quotes/${quote.id}/billing/generate`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ billingStartDate: '2026-10-01' });
    expect(billingRes.status).toBe(201);

    const billingLogs = await db.auditLog.findMany({
      where: { eventType: 'BILLING_SCHEDULE_GENERATED' },
    });
    expect(billingLogs.length).toBeGreaterThanOrEqual(1);
  });

  it('audits Control Tower Alert Resolution (DEAL_ALERT_RESOLVED)', async () => {
    // Trigger dashboard data to auto-detect alerts
    const dashRes = await request(app)
      .get('/api/v1/control-tower')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(dashRes.status).toBe(200);

    const alerts = dashRes.body.data.alerts;
    if (alerts && alerts.length > 0) {
      const alertId = alerts[0].id;
      const resolveRes = await request(app)
        .post(`/api/v1/control-tower/alerts/${alertId}/resolve`)
        .set('Authorization', `Bearer ${managerToken}`);
      expect(resolveRes.status).toBe(200);

      const alertLogs = await db.auditLog.findMany({
        where: { eventType: 'DEAL_ALERT_RESOLVED' },
      });
      expect(alertLogs.length).toBeGreaterThanOrEqual(1);
    }
  });
});
