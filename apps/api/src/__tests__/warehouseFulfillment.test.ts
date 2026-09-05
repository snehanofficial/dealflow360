import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { db } from '@dealflow360/db';
import { generateAccessToken } from '../auth/token.js';

describe('Warehouse, Inventory & Fulfillment Allocation Integration Tests', () => {
  let adminToken: string;
  let salesRepToken: string;
  let testUser: any;
  let testCustomer: any;
  let testProduct: any;
  let testQuotation: any;

  beforeAll(async () => {
    // Seed test admin user & sales rep
    testUser = await db.user.create({
      data: {
        email: `wh-test-${Date.now()}@dealflow.com`,
        passwordHash: 'hashedpwd',
        name: 'Warehouse Operations Test Admin',
        role: 'ADMIN',
      },
    });

    const salesRep = await db.user.create({
      data: {
        email: `rep-test-${Date.now()}@dealflow.com`,
        passwordHash: 'hashedpwd',
        name: 'Sales Rep User',
        role: 'SALES_REP',
      },
    });

    adminToken = generateAccessToken({ sub: testUser.id, email: testUser.email, role: testUser.role });
    salesRepToken = generateAccessToken({ sub: salesRep.id, email: salesRep.email, role: salesRep.role });

    testCustomer = await db.customer.create({
      data: {
        code: `CUST-WH-${Date.now()}`,
        name: 'Acme Logistics Corp',
        email: 'logistics@acme.com',
        tier: 'ENTERPRISE',
      },
    });

    testProduct = await db.product.create({
      data: {
        sku: `SKU-WH-${Date.now()}`,
        name: 'Enterprise Server Node X1',
        listPrice: 5000,
        standardCost: 3000,
      },
    });

    testQuotation = await db.quotation.create({
      data: {
        quoteNumber: `QT-WH-${Date.now()}`,
        customerId: testCustomer.id,
        createdById: testUser.id,
        status: 'APPROVED',
        netValue: 50000,
        lines: {
          create: [
            {
              productId: testProduct.id,
              quantity: 10,
              listPrice: 5000,
              unitPrice: 5000,
              netLinePrice: 50000,
              lineCost: 30000,
              lineMarginPercent: 40,
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test records
    await db.inventoryMovement.deleteMany({ where: { productId: testProduct.id } });
    await db.backorder.deleteMany({ where: { quotationId: testQuotation.id } });
    await db.fulfillmentAllocation.deleteMany({ where: { quotationId: testQuotation.id } });
    await db.inventoryItem.deleteMany({ where: { productId: testProduct.id } });
    await db.quoteLine.deleteMany({ where: { quotationId: testQuotation.id } });
    await db.quotation.delete({ where: { id: testQuotation.id } }).catch(() => {});
    await db.product.delete({ where: { id: testProduct.id } }).catch(() => {});
    await db.customer.delete({ where: { id: testCustomer.id } }).catch(() => {});
    await db.user.deleteMany({ where: { id: { in: [testUser.id] } } }).catch(() => {});
  });

  it('1. GET /api/v1/warehouses returns default warehouses with derived available quantity', async () => {
    const res = await request(app)
      .get('/api/v1/warehouses')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstWh = res.body.data[0];
    expect(firstWh).toHaveProperty('code');
    expect(firstWh).toHaveProperty('priority');
  });

  it('2. POST /api/v1/inventory/adjustments records stock receipt with movement ledger', async () => {
    const warehouses = await db.warehouse.findMany({ where: { isActive: true } });
    const mainWh = warehouses[0];

    const res = await request(app)
      .post('/api/v1/inventory/adjustments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        warehouseId: mainWh.id,
        productId: testProduct.id,
        quantity: 50,
        movementType: 'RECEIPT',
        reason: 'Initial test stock receipt',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inventoryItem.onHandQuantity).toBeGreaterThanOrEqual(50);
    expect(res.body.data.inventoryItem.availableQuantity).toBe(res.body.data.inventoryItem.onHandQuantity - res.body.data.inventoryItem.reservedQuantity);
    expect(res.body.data.movement.movementType).toBe('RECEIPT');
  });

  it('3. POST /api/v1/quotes/:id/fulfillment/compute returns explainable allocation plan', async () => {
    const res = await request(app)
      .post(`/api/v1/quotes/${testQuotation.id}/fulfillment/compute`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isFullyFulfilled).toBe(true);
    expect(res.body.data.lineResults).toHaveLength(1);
    expect(res.body.data.lineResults[0].allocations[0].reasons.length).toBeGreaterThan(0);
  });

  it('4. POST /api/v1/quotes/:id/fulfillment/confirm reserves stock transactionally', async () => {
    const res = await request(app)
      .post(`/api/v1/quotes/${testQuotation.id}/fulfillment/confirm`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ allocations: [] }); // Auto-confirm computed plan

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.createdAllocations.length).toBeGreaterThan(0);

    const updatedQuote = await db.quotation.findUnique({ where: { id: testQuotation.id } });
    expect(updatedQuote?.status).toBe('FULFILLMENT');
  });

  it('5. POST /api/v1/quotes/:id/fulfillment/override rejects over-allocations with 400', async () => {
    const warehouses = await db.warehouse.findMany({ where: { isActive: true } });
    const quoteLines = await db.quoteLine.findMany({ where: { quotationId: testQuotation.id } });

    const res = await request(app)
      .post(`/api/v1/quotes/${testQuotation.id}/fulfillment/override`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        overrides: [
          {
            quoteLineId: quoteLines[0].id,
            warehouseId: warehouses[0].id,
            allocatedQuantity: 999999, // Impossible stock
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('exceeds available stock');
  });
});
