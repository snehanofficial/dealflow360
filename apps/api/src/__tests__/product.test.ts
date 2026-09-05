import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

// Mock DB client calls
vi.mock('@dealflow360/db', () => {
  const productsMap = new Map<string, any>();

  return {
    db: {
      product: {
        findUnique: vi.fn(async ({ where }: { where: { sku?: string; id?: string } }) => {
          if (where.sku) {
            for (const p of productsMap.values()) {
              if (p.sku === where.sku) return p;
            }
            return null;
          }
          if (where.id) {
            return productsMap.get(where.id) || null;
          }
          return null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newProduct = {
            id: `prod-${Date.now()}`,
            sku: data.sku,
            name: data.name,
            description: data.description || null,
            category: data.category,
            listPrice: data.listPrice,
            standardCost: data.standardCost,
            maxAllowedDiscount: data.maxAllowedDiscount ?? 15,
            billingType: data.billingType || 'ONE_TIME',
            recurringPeriod: data.recurringPeriod || null,
            isActive: data.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          productsMap.set(newProduct.id, newProduct);
          return newProduct;
        }),
        findMany: vi.fn(async ({ where, skip, take }: { where?: any; skip?: number; take?: number }) => {
          let list = Array.from(productsMap.values());
          if (where?.category) {
            list = list.filter((p) => p.category === where.category);
          }
          const start = skip || 0;
          return take ? list.slice(start, start + take) : list;
        }),
        count: vi.fn(async ({ where }: { where?: any }) => {
          let list = Array.from(productsMap.values());
          if (where?.category) {
            list = list.filter((p) => p.category === where.category);
          }
          return list.length;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = productsMap.get(where.id);
          if (!existing) return null;
          const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
          };
          productsMap.set(where.id, updated);
          return updated;
        }),
      },
    },
  };
});

describe('Product Catalog & Base Pricing API (Developer A Phase A2)', () => {
  let salesRepToken: string;
  let salesManagerToken: string;
  let customerToken: string;

  beforeEach(() => {
    salesRepToken = generateAccessToken({ sub: 'user-sales-rep', email: 'rep@dealflow.com', role: 'SALES_REP' });
    salesManagerToken = generateAccessToken({ sub: 'user-manager', email: 'manager@dealflow.com', role: 'SALES_MANAGER' });
    customerToken = generateAccessToken({ sub: 'user-cust', email: 'customer@acme.com', role: 'CUSTOMER' });
  });

  it('AC-1: allows Sales Manager to create a new product with base pricing & max discount', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        sku: 'HW-SRV-001',
        name: 'Enterprise Rack Server X100',
        description: 'High performance 2U enterprise rack server',
        category: 'HARDWARE',
        type: 'ONE_TIME',
        unitPrice: 4999.99,
        costPrice: 3200.0,
        maxAllowedDiscount: 20.0,
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sku).toBe('HW-SRV-001');
    expect(res.body.data.unitPrice).toBe(4999.99);
    expect(res.body.data.costPrice).toBe(3200.0);
    expect(res.body.data.maxAllowedDiscount).toBe(20.0);
  });

  it('AC-2: allows Sales Rep to list products and filter by category', async () => {
    const res = await request(app)
      .get('/api/v1/products?category=HARDWARE')
      .set('Authorization', `Bearer ${salesRepToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items[0].category).toBe('HARDWARE');
  });

  it('AC-3: returns 409 conflict when creating product with duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        sku: 'HW-SRV-001',
        name: 'Duplicate Server SKU',
        category: 'HARDWARE',
        unitPrice: 1000.0,
        costPrice: 500.0,
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_SKU');
  });

  it('AC-4: denies product creation for unauthorized CUSTOMER role (403)', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        sku: 'HW-UNAUTH-01',
        name: 'Unauthorized Product',
        category: 'HARDWARE',
        unitPrice: 100.0,
        costPrice: 50.0,
      });

    expect(res.status).toBe(403);
  });

  it('AC-5: allows Sales Manager to update base price and max allowed discount', async () => {
    // Create product first
    const createRes = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        sku: 'SW-LIC-002',
        name: 'Cloud Operations License Annual',
        category: 'SOFTWARE_LICENSE',
        type: 'RECURRING',
        unitPrice: 1200.0,
        costPrice: 200.0,
        maxAllowedDiscount: 15.0,
      });

    const productId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        unitPrice: 1350.0,
        maxAllowedDiscount: 18.0,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.unitPrice).toBe(1350.0);
    expect(patchRes.body.data.maxAllowedDiscount).toBe(18.0);
  });

  it('AC-6: retrieves single product by ID', async () => {
    const createRes = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        sku: 'SUP-ENT-003',
        name: 'Enterprise 24/7 Support Tier',
        category: 'SUPPORT',
        type: 'RECURRING',
        unitPrice: 5000.0,
        costPrice: 1500.0,
      });

    const productId = createRes.body.data.id;

    const getRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${salesRepToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.sku).toBe('SUP-ENT-003');
    expect(getRes.body.data.name).toBe('Enterprise 24/7 Support Tier');
  });
});
