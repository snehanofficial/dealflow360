import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Recommendations & Quotation Lines API', () => {
  let authToken: string;
  const testQuoteId = 'quote-sample-001';

  beforeAll(async () => {
    // Authenticate as sales_rep to obtain JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'sales.rep@dealflow360.com',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.data.accessToken;
  });

  it('rejects unauthenticated recommendation requests with 401', async () => {
    const res = await request(app).get(
      `/api/v1/quotations/${testQuoteId}/recommendations`,
    );
    expect(res.status).toBe(401);
  });

  it('retrieves ranked recommendations for a valid quotation', async () => {
    const res = await request(app)
      .get(`/api/v1/quotations/${testQuoteId}/recommendations`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstRec = res.body.data[0];
    expect(firstRec).toHaveProperty('ruleId');
    expect(firstRec).toHaveProperty('productId');
    expect(firstRec).toHaveProperty('reason');
    expect(firstRec).toHaveProperty('rankScore');
    expect(firstRec).toHaveProperty('marginImpact');
    expect(firstRec.marginImpact).toHaveProperty('additionalRevenue');
    expect(firstRec.marginImpact).toHaveProperty('marginDeltaPercent');
  });

  it('adds a recommended product line to quotation and updates total', async () => {
    // Retrieve recommendations
    const recRes = await request(app)
      .get(`/api/v1/quotations/${testQuoteId}/recommendations`)
      .set('Authorization', `Bearer ${authToken}`);

    const rec = recRes.body.data[0];
    expect(rec).toBeDefined();

    // Add recommended product to quote
    const addRes = await request(app)
      .post(`/api/v1/quotations/${testQuoteId}/lines`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId: rec.productId,
        quantity: 1,
        proposedDiscountPercent: rec.promotionDiscountPercent || 0,
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.data).toHaveProperty('lines');

    const addedLine = addRes.body.data.lines.find(
      (l: any) => l.productId === rec.productId,
    );
    expect(addedLine).toBeDefined();

    // Re-fetch recommendations and verify the added item is no longer recommended
    const updatedRecRes = await request(app)
      .get(`/api/v1/quotations/${testQuoteId}/recommendations`)
      .set('Authorization', `Bearer ${authToken}`);

    const stillRecommended = updatedRecRes.body.data.some(
      (r: any) => r.productId === rec.productId,
    );
    expect(stillRecommended).toBe(false);
  });
});
