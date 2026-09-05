import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../auth/token.js';

vi.mock('@dealflow360/db', () => {
  const priceListsMap = new Map<string, any>();
  const entriesMap = new Map<string, any>();

  return {
    db: {
      priceList: {
        findMany: vi.fn(async () => Array.from(priceListsMap.values())),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => priceListsMap.get(where.id) || null),
        findFirst: vi.fn(async ({ where }: { where: any }) => {
          for (const list of priceListsMap.values()) {
            if (where.customerTier && list.customerTier !== where.customerTier) continue;
            if (where.currency && list.currency !== where.currency) continue;
            if (where.isDefault && !list.isDefault) continue;
            if (where.isActive && !list.isActive) continue;
            if (where.NOT?.id && list.id === where.NOT.id) continue;
            return list;
          }
          return null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const newList = {
            id: `pl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: data.name,
            customerTier: data.customerTier || null,
            currency: data.currency || 'USD',
            isDefault: data.isDefault ?? false,
            isActive: data.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
            entries: [],
          };
          priceListsMap.set(newList.id, newList);
          return newList;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = priceListsMap.get(where.id);
          if (!existing) return null;
          const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
          };
          priceListsMap.set(where.id, updated);
          return updated;
        }),
        updateMany: vi.fn(async ({ where, data }: { where: any; data: any }) => {
          for (const list of priceListsMap.values()) {
            if (where.currency && list.currency !== where.currency) continue;
            if (where.isDefault && !list.isDefault) continue;
            if (where.NOT?.id && list.id === where.NOT.id) continue;
            Object.assign(list, data);
          }
          return { count: 1 };
        }),
        delete: vi.fn(async ({ where }: { where: { id: string } }) => {
          priceListsMap.delete(where.id);
          return { id: where.id };
        }),
      },
      priceListEntry: {
        upsert: vi.fn(async ({ where, update, create }: { where: any; update: any; create: any }) => {
          const key = `${where.priceListId_productId.priceListId}_${where.priceListId_productId.productId}`;
          const existing = entriesMap.get(key);
          if (existing) {
            const updated = { ...existing, ...update };
            entriesMap.set(key, updated);
            return updated;
          }
          const created = {
            id: `ple-${Date.now()}`,
            priceListId: create.priceListId,
            productId: create.productId,
            unitPrice: create.unitPrice,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          entriesMap.set(key, created);
          
          // Also attach to parent list for convenience in mock
          const list = priceListsMap.get(create.priceListId);
          if (list) {
            list.entries = list.entries.filter((e: any) => e.productId !== create.productId);
            list.entries.push(created);
          }
          return created;
        }),
        deleteMany: vi.fn(async ({ where }: { where: any }) => {
          const key = `${where.priceListId}_${where.productId}`;
          entriesMap.delete(key);
          const list = priceListsMap.get(where.priceListId);
          if (list) {
            list.entries = list.entries.filter((e: any) => e.productId !== where.productId);
          }
          return { count: 1 };
        }),
      },
    },
  };
});

describe('Price List Management API Tests (Developer A Phase A2)', () => {
  let salesManagerToken: string;
  let salesRepToken: string;

  beforeEach(() => {
    salesManagerToken = generateAccessToken({ sub: 'mgr-1', email: 'mgr@dealflow.com', role: 'SALES_MANAGER' });
    salesRepToken = generateAccessToken({ sub: 'rep-1', email: 'rep@dealflow.com', role: 'SALES_REP' });
  });

  it('GET /api/v1/price-lists returns list of price lists', async () => {
    const res = await request(app)
      .get('/api/v1/price-lists')
      .set('Authorization', `Bearer ${salesRepToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/price-lists creates a new price list for ENTERPRISE tier and INR', async () => {
    const res = await request(app)
      .post('/api/v1/price-lists')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Enterprise India Pricing',
        customerTier: 'ENTERPRISE',
        currency: 'INR',
        isDefault: true,
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Enterprise India Pricing');
    expect(res.body.data.customerTier).toBe('ENTERPRISE');
    expect(res.body.data.currency).toBe('INR');
  });

  it('PATCH /api/v1/price-lists/:id updates price list metadata & default status', async () => {
    const createRes = await request(app)
      .post('/api/v1/price-lists')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Tier 1 USD Pricing',
        customerTier: 'TIER_1',
        currency: 'USD',
        isDefault: false,
        isActive: true,
      });

    const listId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/price-lists/${listId}`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Tier 1 USD Pricing Updated',
        isDefault: true,
        isActive: false,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.name).toBe('Tier 1 USD Pricing Updated');
    expect(patchRes.body.data.isActive).toBe(false);
  });

  it('POST & DELETE entries on /api/v1/price-lists/:id/entries', async () => {
    const createRes = await request(app)
      .post('/api/v1/price-lists')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Enterprise USD Pricing',
        customerTier: 'ENTERPRISE',
        currency: 'USD',
      });

    const listId = createRes.body.data.id;

    // Add entry
    const entryRes = await request(app)
      .post(`/api/v1/price-lists/${listId}/entries`)
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        productId: 'prod-123',
        unitPrice: 4500.0,
      });

    expect(entryRes.status).toBe(200);
    expect(entryRes.body.data.unitPrice).toBe(4500.0);

    // Delete entry
    const delRes = await request(app)
      .delete(`/api/v1/price-lists/${listId}/entries/prod-123`)
      .set('Authorization', `Bearer ${salesManagerToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  it('DELETE /api/v1/price-lists/:id removes a price list', async () => {
    const createRes = await request(app)
      .post('/api/v1/price-lists')
      .set('Authorization', `Bearer ${salesManagerToken}`)
      .send({
        name: 'Temporary List to Delete',
        currency: 'EUR',
      });

    const listId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/v1/price-lists/${listId}`)
      .set('Authorization', `Bearer ${salesManagerToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });
});
