import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { db } from '@dealflow360/db';
import { generateAccessToken } from '../auth/token.js';
import argon2 from 'argon2';

describe('Customer Portal & Ownership Isolation Integration Test Suite', () => {
  let customerUser1: any;
  let customerUser2: any;
  let unboundCustomerUser: any;
  let customerAccount1: any;
  let customerAccount2: any;
  let quoteCustomer1: any;
  let quoteCustomer2: any;
  let invoiceCustomer1: any;
  let invoiceCustomer2: any;

  let tokenCustomer1: string;
  let tokenCustomer2: string;
  let tokenUnboundCustomer: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    const defaultPasswordHash = await argon2.hash('Password123!', { type: argon2.argon2id });

    // Seed Customer Account 1 & 2
    customerAccount1 = await db.customer.upsert({
      where: { id: 'cust-portal-test-001' },
      update: { name: 'Acme Test Corp 1', email: 'cust1@test.com' },
      create: {
        id: 'cust-portal-test-001',
        code: 'CUST-TEST-001',
        name: 'Acme Test Corp 1',
        email: 'cust1@test.com',
        tier: 'ENTERPRISE',
        creditLimit: 100000,
        region: 'US-East',
      },
    });

    customerAccount2 = await db.customer.upsert({
      where: { id: 'cust-portal-test-002' },
      update: { name: 'Beta Test Corp 2', email: 'cust2@test.com' },
      create: {
        id: 'cust-portal-test-002',
        code: 'CUST-TEST-002',
        name: 'Beta Test Corp 2',
        email: 'cust2@test.com',
        tier: 'GOLD',
        creditLimit: 50000,
        region: 'US-West',
      },
    });

    // Seed Customer User 1 (bound to Customer 1)
    customerUser1 = await db.user.upsert({
      where: { email: 'customer1@portaltest.com' },
      update: { customerId: customerAccount1.id },
      create: {
        email: 'customer1@portaltest.com',
        name: 'Cust1 User',
        role: 'CUSTOMER',
        customerId: customerAccount1.id,
        passwordHash: defaultPasswordHash,
      },
    });

    // Seed Customer User 2 (bound to Customer 2)
    customerUser2 = await db.user.upsert({
      where: { email: 'customer2@portaltest.com' },
      update: { customerId: customerAccount2.id },
      create: {
        email: 'customer2@portaltest.com',
        name: 'Cust2 User',
        role: 'CUSTOMER',
        customerId: customerAccount2.id,
        passwordHash: defaultPasswordHash,
      },
    });

    // Seed Unbound Customer User (no customerId)
    unboundCustomerUser = await db.user.upsert({
      where: { email: 'unbound@portaltest.com' },
      update: { customerId: null },
      create: {
        email: 'unbound@portaltest.com',
        name: 'Unbound User',
        role: 'CUSTOMER',
        customerId: null,
        passwordHash: defaultPasswordHash,
      },
    });

    // Seed Products
    const testProduct = await db.product.upsert({
      where: { sku: 'SKU-PORTAL-TEST-01' },
      update: {},
      create: {
        sku: 'SKU-PORTAL-TEST-01',
        name: 'Test Enterprise Server',
        listPrice: 5000,
        standardCost: 3000,
        category: 'Hardware',
        billingType: 'ONE_TIME',
      },
    });

    // Seed Quotation for Customer 1
    quoteCustomer1 = await db.quotation.create({
      data: {
        quoteNumber: 'QT-CUST1-001',
        customerId: customerAccount1.id,
        createdById: customerUser1.id,
        status: 'APPROVED',
        subtotal: 5000,
        totalDiscount: 500,
        netValue: 4500,
        grossMarginPercent: 33.3,
        riskScore: 2.1,
        riskLevel: 'LOW',
        lines: {
          create: {
            productId: testProduct.id,
            quantity: 1,
            listPrice: 5000,
            unitPrice: 4500,
            proposedDiscountPercent: 10,
            discountAmount: 500,
            lineCost: 3000,
            lineMarginPercent: 33.3,
            netLinePrice: 4500,
          },
        },
      },
    });

    // Seed Quotation for Customer 2
    quoteCustomer2 = await db.quotation.create({
      data: {
        quoteNumber: 'QT-CUST2-002',
        customerId: customerAccount2.id,
        createdById: customerUser2.id,
        status: 'APPROVED',
        subtotal: 10000,
        totalDiscount: 1000,
        netValue: 9000,
        grossMarginPercent: 33.3,
        riskScore: 1.5,
        riskLevel: 'LOW',
      },
    });

    // Seed Invoice for Customer 1
    invoiceCustomer1 = await db.invoice.create({
      data: {
        invoiceNumber: 'INV-CUST1-001',
        quotationId: quoteCustomer1.id,
        customerId: customerAccount1.id,
        customerName: customerAccount1.name,
        customerEmail: customerAccount1.email,
        createdById: customerUser1.id,
        status: 'ISSUED',
        subtotal: 5000,
        totalDiscount: 500,
        taxAmount: 0,
        totalAmount: 4500,
        lines: {
          create: {
            productName: 'Test Enterprise Server',
            productSku: 'SKU-PORTAL-TEST-01',
            quantity: 1,
            listPrice: 5000,
            unitPrice: 4500,
            lineTotal: 4500,
          },
        },
      },
    });

    // Seed Invoice for Customer 2
    invoiceCustomer2 = await db.invoice.create({
      data: {
        invoiceNumber: 'INV-CUST2-002',
        quotationId: quoteCustomer2.id,
        customerId: customerAccount2.id,
        customerName: customerAccount2.name,
        customerEmail: customerAccount2.email,
        createdById: customerUser2.id,
        status: 'ISSUED',
        subtotal: 10000,
        totalDiscount: 1000,
        taxAmount: 0,
        totalAmount: 9000,
      },
    });

    tokenCustomer1 = generateAccessToken({ sub: customerUser1.id, email: customerUser1.email, role: 'CUSTOMER' });
    tokenCustomer2 = generateAccessToken({ sub: customerUser2.id, email: customerUser2.email, role: 'CUSTOMER' });
    tokenUnboundCustomer = generateAccessToken({ sub: unboundCustomerUser.id, email: unboundCustomerUser.email, role: 'CUSTOMER' });
    tokenAdmin = generateAccessToken({ sub: 'admin-id', email: 'admin@dealflow.com', role: 'ADMIN' });
  });

  afterAll(async () => {
    if (invoiceCustomer1?.id && invoiceCustomer2?.id) {
      await db.invoiceLine.deleteMany({ where: { invoiceId: { in: [invoiceCustomer1.id, invoiceCustomer2.id] } } });
      await db.invoice.deleteMany({ where: { id: { in: [invoiceCustomer1.id, invoiceCustomer2.id] } } });
    }
    if (quoteCustomer1?.id && quoteCustomer2?.id) {
      await db.quoteLine.deleteMany({ where: { quotationId: { in: [quoteCustomer1.id, quoteCustomer2.id] } } });
      await db.quotation.deleteMany({ where: { id: { in: [quoteCustomer1.id, quoteCustomer2.id] } } });
    }
    if (customerUser1?.id) {
      await db.user.deleteMany({ where: { id: { in: [customerUser1.id, customerUser2.id, unboundCustomerUser.id] } } });
    }
    if (customerAccount1?.id) {
      await db.customer.deleteMany({ where: { id: { in: [customerAccount1.id, customerAccount2.id] } } });
    }
  });

  it('1. Customer Login and /auth/me returns customerId context from DB', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('CUSTOMER');
    expect(res.body.data.user.customerId).toBe(customerAccount1.id);
    expect(res.body.data.permissions).toContain('dashboard.view');
    expect(res.body.data.permissions).toContain('quotation.view');
    expect(res.body.data.permissions).toContain('billing.view');
  });

  it('2. Unbound Customer user fails safely with HTTP 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${tokenUnboundCustomer}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('not bound to a valid customer account');
  });

  it('3. GET /api/v1/dashboard returns customer-scoped metrics & recent quotes for Customer 1', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('CUSTOMER');
    expect(res.body.data.user.name).toBe('Acme Test Corp 1');
    expect(res.body.data.recentQuotations.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.recentQuotations[0].quoteNumber).toBe('QT-CUST1-001');
  });

  it('4. GET /api/v1/quotes returns only Customer 1 quotes and sanitizes internal commercial fields', async () => {
    const res = await request(app)
      .get('/api/v1/quotes')
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const quotes = res.body.data;
    expect(quotes.every((q: any) => q.customerId === customerAccount1.id)).toBe(true);

    const targetQuote = quotes.find((q: any) => q.id === quoteCustomer1.id);
    expect(targetQuote).toBeDefined();
    // Sanitized: no standardCost or margin
    expect(targetQuote.grossMarginPercent).toBeUndefined();
    expect(targetQuote.riskScore).toBeUndefined();
    if (targetQuote.lines && targetQuote.lines.length > 0) {
      expect(targetQuote.lines[0].product.standardCost).toBeUndefined();
    }
  });

  it('5. Customer A accessing Customer B quotation returns HTTP 404 Not Found (Non-Disclosure)', async () => {
    const res = await request(app)
      .get(`/api/v1/quotes/${quoteCustomer2.id}`)
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('6. GET /api/v1/invoices returns only Customer 1 invoices with standardized meta envelope', async () => {
    const res = await request(app)
      .get('/api/v1/invoices')
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(typeof res.body.meta.total).toBe('number');
    expect(res.body.data.every((inv: any) => inv.customerId === customerAccount1.id)).toBe(true);
  });

  it('7. Customer A accessing Customer B invoice returns HTTP 404 Not Found (Non-Disclosure)', async () => {
    const res = await request(app)
      .get(`/api/v1/invoices/${invoiceCustomer2.id}`)
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('8. Customer role receiving 403 Forbidden on internal governance routes', async () => {
    const approvalRes = await request(app)
      .get('/api/v1/approvals')
      .set('Authorization', `Bearer ${tokenCustomer1}`);
    expect(approvalRes.status).toBe(403);

    const auditRes = await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${tokenCustomer1}`);
    expect(auditRes.status).toBe(403);

    const discountRes = await request(app)
      .get('/api/v1/discount-policies')
      .set('Authorization', `Bearer ${tokenCustomer1}`);
    expect(discountRes.status).toBe(403);
  });

  it('9. Customer dashboard DTO strictly omits internal margins, costs, and internal approval items', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${tokenCustomer1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('CUSTOMER');
    expect(res.body.data.pendingApprovals).toEqual([]);
    expect(res.body.data.recentActivity).toEqual([]);
    expect(res.body.data.pipeline).toEqual([]);
  });
});
