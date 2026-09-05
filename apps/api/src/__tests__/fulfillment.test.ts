import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const warehousesMap = new Map<string, any>();
  const quotesMap = new Map<string, any>();
  const allocationsMap = new Map<string, any>();
  const inventoryMap = new Map<string, any>();

  const whEast = { id: 'wh-east', code: 'WH-EAST', name: 'East Coast DC', location: 'US-East', isActive: true };
  const whWest = { id: 'wh-west', code: 'WH-WEST', name: 'West Coast DC', location: 'US-West', isActive: true };
  warehousesMap.set(whEast.id, whEast);
  warehousesMap.set(whWest.id, whWest);

  const product1 = { id: 'prod-ff-01', sku: 'PROD-FF-01', name: 'Server Rack', listPrice: 3000, standardCost: 1500 };
  const customer1 = { id: 'cust-ff-01', name: 'Fulfillment Client Corp', code: 'CUST-FF' };

  const defaultQuote = {
    id: 'quote-ff-01',
    quoteNumber: 'QT-FF-001',
    status: 'APPROVED',
    customerId: customer1.id,
    customer: customer1,
    lines: [
      {
        id: 'line-ff-01',
        productId: product1.id,
        quantity: 15,
        listPrice: 3000,
        proposedDiscountPercent: 10,
        netLinePrice: 40500,
        product: product1,
      },
    ],
    fulfillmentAllocations: [],
  };
  quotesMap.set(defaultQuote.id, defaultQuote);

  const itemEast = { id: 'inv-01', warehouseId: 'wh-east', productId: 'prod-ff-01', onHandQuantity: 10, reservedQuantity: 0, availableQuantity: 10, warehouse: whEast, product: product1 };
  const itemWest = { id: 'inv-02', warehouseId: 'wh-west', productId: 'prod-ff-01', onHandQuantity: 20, reservedQuantity: 0, availableQuantity: 20, warehouse: whWest, product: product1 };
  inventoryMap.set(`${itemEast.warehouseId}_${itemEast.productId}`, itemEast);
  inventoryMap.set(`${itemWest.warehouseId}_${itemWest.productId}`, itemWest);

  return {
    Prisma: { JsonNull: 'DbNull' },
    db: {
      warehouse: {
        findMany: vi.fn(async () => Array.from(warehousesMap.values())),
        create: vi.fn(async ({ data }: { data: any }) => data),
      },
      product: {
        findMany: vi.fn(async () => [product1]),
      },
      inventoryItem: {
        findMany: vi.fn(async () => [itemEast, itemWest]),
        findUnique: vi.fn(async ({ where }: { where: any }) => {
          if (where.warehouseId_productId) {
            return inventoryMap.get(`${where.warehouseId_productId.warehouseId}_${where.warehouseId_productId.productId}`) || null;
          }
          return null;
        }),
        upsert: vi.fn(async ({ create }: { create: any }) => create),
        update: vi.fn(async ({ where, data }: { where: any; data: any }) => {
          const item = Array.from(inventoryMap.values()).find((i) => i.id === where.id);
          if (item) Object.assign(item, data);
          return item;
        }),
      },
      quotation: {
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => quotesMap.get(where.id) || null),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const q = quotesMap.get(where.id);
          if (!q) return null;
          Object.assign(q, data);
          return q;
        }),
      },
      fulfillmentAllocation: {
        deleteMany: vi.fn(async () => ({ count: 0 })),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newAlloc = { id: `alloc-${Date.now()}`, ...data };
          allocationsMap.set(newAlloc.id, newAlloc);
          return newAlloc;
        }),
      },
      auditLog: {
        create: vi.fn(async ({ data }: any) => ({ id: 'audit-1', createdAt: new Date(), ...data })),
      },
    },
  };
});

describe('Multi-Warehouse Fulfillment API (Developer B Phase B3)', () => {
  let repToken: string;

  beforeEach(() => {
    repToken = generateAccessToken({ sub: 'user-sales-rep', email: 'rep@dealflow.com', role: 'SALES_REP' });
  });

  it('lists active warehouses and inventory items', async () => {
    const res = await request(app)
      .get('/api/v1/fulfillment/warehouses')
      .set('Authorization', `Bearer ${repToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('computes recommended multi-warehouse split fulfillment plan', async () => {
    const res = await request(app)
      .post('/api/v1/quotes/quote-ff-01/fulfillment/compute')
      .set('Authorization', `Bearer ${repToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isFullyFulfilled).toBe(true);
    expect(res.body.data.totalAllocated).toBe(15);
    expect(res.body.data.lineResults[0].allocations).toHaveLength(1);
    expect(res.body.data.lineResults[0].allocations[0].warehouseCode).toBe('WH-WEST');
  });

  it('saves valid manual fulfillment allocation overrides and updates quote status', async () => {
    const res = await request(app)
      .post('/api/v1/quotes/quote-ff-01/fulfillment/override')
      .set('Authorization', `Bearer ${repToken}`)
      .send({
        overrides: [
          { quoteLineId: 'line-ff-01', warehouseId: 'wh-east', allocatedQuantity: 5 },
          { quoteLineId: 'line-ff-01', warehouseId: 'wh-west', allocatedQuantity: 10 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('rejects manual allocation override exceeding warehouse stock (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/quotes/quote-ff-01/fulfillment/override')
      .set('Authorization', `Bearer ${repToken}`)
      .send({
        overrides: [
          { quoteLineId: 'line-ff-01', warehouseId: 'wh-east', allocatedQuantity: 999 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
