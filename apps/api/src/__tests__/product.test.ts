import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

// Mock DB client calls
vi.mock('@dealflow360/db', () => {
  const productsMap = new Map<string, any>();
  const categoriesMap = new Map<string, any>([
    ['cat-1', { id: 'cat-1', name: 'Hardware', code: 'HARDWARE' }],
    ['cat-2', { id: 'cat-2', name: 'Software License', code: 'SOFTWARE_LICENSE' }],
  ]);
  const priceListsMap = new Map<string, any>();

  return {
    db: {
      category: {
        findMany: vi.fn(async () => Array.from(categoriesMap.values())),
        findUnique: vi.fn(async ({ where }: { where: { id?: string; code?: string } }) => {
          if (where.code) {
            for (const c of categoriesMap.values()) {
              if (c.code === where.code) return c;
            }
            return null;
          }
          return categoriesMap.get(where.id || '') || null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newCat = { id: `cat-${Date.now()}`, ...data };
          categoriesMap.set(newCat.id, newCat);
          return newCat;
        }),
        upsert: vi.fn(async ({ where, create }: { where: { code: string }; create: any }) => {
          for (const c of categoriesMap.values()) {
            if (c.code === where.code) return c;
          }
          const newCat = { id: `cat-${Date.now()}`, ...create };
          categoriesMap.set(newCat.id, newCat);
          return newCat;
        }),
      },
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
          const primaryCat = Array.from(categoriesMap.values())[0] || { id: 'cat-1', name: 'Hardware', code: 'HARDWARE' };
          const newProduct = {
            id: `prod-${Date.now()}`,
            sku: data.sku,
            name: data.name,
            description: data.description || null,
            category: data.category || 'HARDWARE',
            unit: data.unit || 'Unit',
            taxRate: data.taxRate ?? 0,
            listPrice: data.listPrice,
            standardCost: data.standardCost,
            maxAllowedDiscount: data.maxAllowedDiscount ?? 15,
            billingType: data.billingType || 'ONE_TIME',
            recurringPeriod: data.recurringPeriod || null,
            isActive: data.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
            categories: [
              { categoryId: primaryCat.id, isPrimary: true, category: primaryCat },
            ],
            variants: data.variants?.create
              ? data.variants.create.map((v: any) => ({
                  id: `var-${Date.now()}`,
                  sku: v.sku,
                  name: v.name,
                  extraPrice: v.extraPrice || 0,
                  isActive: true,
                  attributes: [],
                }))
              : [],
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
      priceList: {
        findMany: vi.fn(async () => Array.from(priceListsMap.values())),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => priceListsMap.get(where.id) || null),
        findFirst: vi.fn(async () => null),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newList = {
            id: `pl-${Date.now()}`,
            name: data.name,
            customerTier: data.customerTier || null,
            currency: data.currency || 'USD',
            isDefault: data.isDefault || false,
            isActive: data.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
            entries: data.entries?.create
              ? data.entries.create.map((e: any) => ({
                  id: `ple-${Date.now()}`,
                  priceListId: `pl-${Date.now()}`,
                  productId: e.productId,
                  unitPrice: e.unitPrice,
                }))
              : [],
          };
          priceListsMap.set(newList.id, newList);
          return newList;
        }),
      },
    },
  };
});

describe('Product Catalog, Price Lists & Variants API (Developer A Phase A2)', () => {
  let salesRepToken: string;
  let salesManagerToken: string;
  let customerToken: string;

  beforeEach(() => {
    salesRepToken = generateAccessToken({ sub: 'user-sales-rep', email: 'rep@dealflow.com', role: 'SALES_REP' });
    salesManagerToken = generateAccessToken({ sub: 'user-manager', email: 'manager@dealflow.com', role: 'SALES_MANAGER' });
    customerToken = generateAccessToken({ sub: 'user-cust', email: 'customer@acme.com', role: 'CUSTOMER' });
  });

  it('AC-1: allows Sales Manager to create product with unit, tax rate, and variants', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        sku: 'HW-SRV-001',
        name: 'Enterprise Rack Server X100',
        description: 'High performance 2U enterprise rack server',
        category: 'HARDWARE',
        type: 'ONE_TIME',
        unit: 'Unit',
        taxRate: 18.0,
        unitPrice: 4999.99,
        costPrice: 3200.0,
        maxAllowedDiscount: 20.0,
        isActive: true,
        variants: [
          { sku: 'HW-SRV-001-64GB', name: 'Server 64GB RAM', extraPrice: 250.0 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sku).toBe('HW-SRV-001');
    expect(res.body.data.unit).toBe('Unit');
    expect(res.body.data.taxRate).toBe(18.0);
    expect(res.body.data.unitPrice).toBe(4999.99);
    expect(res.body.data.variants).toHaveLength(1);
    expect(res.body.data.variants[0].sku).toBe('HW-SRV-001-64GB');
  });

  it('AC-2: retrieves relational category list via GET /api/v1/products/categories', async () => {
    const res = await request(app)
      .get('/api/v1/products/categories')
      .set('Authorization', `Bearer ${salesRepToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('AC-3: creates price list via POST /api/v1/products/price-lists', async () => {
    const res = await request(app)
      .post('/api/v1/products/price-lists')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Enterprise Tier USD Price List',
        customerTier: 'ENTERPRISE',
        currency: 'USD',
        isDefault: false,
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Enterprise Tier USD Price List');
    expect(res.body.data.customerTier).toBe('ENTERPRISE');
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

  it('AC-5: updates unit price and tax rate on existing product', async () => {
    const createRes = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        sku: 'SW-LIC-002',
        name: 'Cloud Operations License Annual',
        category: 'SOFTWARE_LICENSE',
        type: 'RECURRING',
        unit: 'License',
        taxRate: 5.0,
        unitPrice: 1200.0,
        costPrice: 200.0,
      });

    const productId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        unitPrice: 1350.0,
        taxRate: 8.5,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.unitPrice).toBe(1350.0);
    expect(patchRes.body.data.taxRate).toBe(8.5);
  });

  it('AC-6: retrieves single product by ID with relational categories and primaryCategory', async () => {
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
    expect(getRes.body.data.primaryCategory).toBeDefined();
    expect(getRes.body.data.categories).toHaveLength(1);
  });
});
