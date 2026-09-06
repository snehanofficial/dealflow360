import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const invoicesMap = new Map<string, any>();
  const quotationsMap = new Map<string, any>();

  const customer1 = {
    id: 'cust-inv-01',
    name: 'Acme Corporation',
    code: 'CUST-INV-01',
    email: 'billing@acme.com',
    phone: '+1-555-0199',
    tier: 'GOLD',
    region: 'US-East',
  };

  const product1 = {
    id: 'prod-inv-01',
    sku: 'SKU-LAPTOP-PRO',
    name: 'Laptop Pro',
    category: 'HARDWARE',
    listPrice: 1000, // Catalog price
    taxRate: 18,
  };

  const approvedQuote = {
    id: 'quote-inv-01',
    quoteNumber: 'QT-INV-2026-001',
    status: 'APPROVED',
    customerId: customer1.id,
    customer: customer1,
    createdById: 'user-sales-rep',
    subtotal: 3000,
    totalDiscount: 300,
    taxableAmount: 2700,
    taxAmount: 486,
    netValue: 3186,
    lines: [
      {
        id: 'line-inv-01',
        productId: product1.id,
        quantity: 2,
        listPrice: 1000,
        unitPrice: 1500, // Approved selling price
        proposedDiscountPercent: 10,
        discountAmount: 300,
        taxRate: 18,
        taxAmount: 486,
        netLinePrice: 3186,
        product: product1,
      },
    ],
  };

  const draftQuote = {
    id: 'quote-draft-01',
    quoteNumber: 'QT-DRAFT-001',
    status: 'DRAFT',
    customerId: customer1.id,
    customer: customer1,
    createdById: 'user-sales-rep',
    lines: [],
  };

  quotationsMap.set(approvedQuote.id, approvedQuote);
  quotationsMap.set(draftQuote.id, draftQuote);

  return {
    Prisma: {
      JsonNull: null,
    },
    InvoiceStatus: {
      DRAFT: 'DRAFT',
      ISSUED: 'ISSUED',
      PAID: 'PAID',
      VOID: 'VOID',
    },
    db: {
      quotation: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => quotationsMap.get(where.id) || null),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const q = quotationsMap.get(where.id);
          if (!q) return null;
          Object.assign(q, data);
          return q;
        }),
      },
      invoice: {
        count: vi.fn(async (params?: any) => {
          const where = params?.where;
          if (!where || Object.keys(where).length === 0) return invoicesMap.size;
          let cnt = 0;
          for (const inv of invoicesMap.values()) {
            if (where.status && inv.status !== where.status) continue;
            if (where.customerId && inv.customerId !== where.customerId) continue;
            cnt++;
          }
          return cnt;
        }),
        findMany: vi.fn(async ({ where }: any) => {
          const res: any[] = [];
          for (const inv of invoicesMap.values()) {
            if (where?.status && inv.status !== where.status) continue;
            if (where?.customerId && inv.customerId !== where.customerId) continue;
            res.push(inv);
          }
          return res;
        }),
        findUnique: vi.fn(async ({ where }: { where: { id?: string; quotationId?: string; invoiceNumber?: string } }) => {
          if (where.id) return invoicesMap.get(where.id) || null;
          if (where.quotationId) {
            for (const inv of invoicesMap.values()) {
              if (inv.quotationId === where.quotationId) return inv;
            }
          }
          return null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const id = `inv-id-${Date.now()}-${Math.random()}`;
          const lines = data.lines?.create?.map((l: any, idx: number) => ({
            id: `inv-line-${idx + 1}`,
            invoiceId: id,
            ...l,
          })) || [];

          const newInvoice = {
            id,
            ...data,
            lines,
            customer: customer1,
            quotation: approvedQuote,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          delete newInvoice.lines.create;
          invoicesMap.set(id, newInvoice);
          return newInvoice;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const inv = invoicesMap.get(where.id);
          if (!inv) return null;
          Object.assign(inv, data);
          return inv;
        }),
      },
      auditLog: {
        create: vi.fn(async ({ data }: any) => ({ id: 'audit-01', createdAt: new Date(), ...data })),
      },
    },
  };
});

describe('Invoicing & Billing API Module Integration Tests', () => {
  let adminToken: string;
  let customerToken: string;

  beforeEach(() => {
    adminToken = generateAccessToken({ sub: 'user-admin', email: 'admin@dealflow.com', role: 'ADMIN' });
    customerToken = generateAccessToken({
      sub: 'user-customer',
      email: 'customer@acme.com',
      role: 'CUSTOMER',
    });
  });

  it('rejects unauthenticated requests to /api/v1/invoices', async () => {
    const res = await request(app).get('/api/v1/invoices');
    expect(res.status).toBe(401);
  });

  it('creates an invoice from an approved quotation with exact commercial snapshot values', async () => {
    const res = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quotationId: 'quote-inv-01', notes: 'Standard 14-day payment term' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoiceNumber).toBe('INV-2026-000001');
    expect(res.body.data.subtotal).toBe(3000);
    expect(res.body.data.taxableAmount).toBe(3000);
    expect(res.body.data.taxAmount).toBe(540);
    expect(res.body.data.totalDiscount).toBe(354);
    expect(res.body.data.totalAmount).toBe(3186);

    // Verify snapshot line item uses approved selling price ₹1,500 (not catalog ₹1,000)
    expect(res.body.data.lines).toHaveLength(1);
    const line = res.body.data.lines[0];
    expect(line.unitPrice).toBe(1500);
    expect(line.listPrice).toBe(1000);
    expect(line.lineTotal).toBe(3186);
  });

  it('prevents duplicate invoice creation for the same quotation', async () => {
    const res = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quotationId: 'quote-inv-01' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('already exists');
  });

  it('rejects invoice creation for unapproved/draft quotation', async () => {
    const res = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quotationId: 'quote-draft-01' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('not eligible');
  });

  it('lists invoices and filters by status', async () => {
    const res = await request(app)
      .get('/api/v1/invoices?status=ISSUED')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('allows marking an issued invoice as PAID and completes quotation', async () => {
    const listRes = await request(app)
      .get('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    const invoiceId = listRes.body.data[0].id;

    const payRes = await request(app)
      .post(`/api/v1/invoices/${invoiceId}/pay`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(payRes.status).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.data.status).toBe('PAID');
  });

  it('exports invoice as PDF document', async () => {
    const listRes = await request(app)
      .get('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    const invoiceId = listRes.body.data[0].id;

    const exportRes = await request(app)
      .get(`/api/v1/invoices/${invoiceId}/export/pdf`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('application/pdf');
    expect(exportRes.headers['content-disposition']).toContain('attachment');
  });

  it('exports invoice as XLSX spreadsheet', async () => {
    const listRes = await request(app)
      .get('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    const invoiceId = listRes.body.data[0].id;

    const exportRes = await request(app)
      .get(`/api/v1/invoices/${invoiceId}/export/xlsx`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('spreadsheetml');
    expect(exportRes.headers['content-disposition']).toContain('attachment');
  });

  it('exports bulk invoices list as XLSX spreadsheet', async () => {
    const exportRes = await request(app)
      .get('/api/v1/invoices/export/xlsx')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('spreadsheetml');
    expect(exportRes.headers['content-disposition']).toContain('attachment');
  });
});
