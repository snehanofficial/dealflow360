import { describe, it, expect } from 'vitest';
import {
  calculateLinePricing,
  calculateQuoteTotals,
  evaluateQuoteRisk,
  evaluateSubmitTransition,
} from '../quote/quoteEngine.js';

describe('quoteEngine domain logic', () => {
  it('calculates line pricing correctly with discount and standard cost', () => {
    const result = calculateLinePricing({
      listPrice: 1000,
      standardCost: 600,
      quantity: 2,
      proposedDiscountPercent: 10,
    });

    expect(result.listPrice).toBe(1000);
    expect(result.quantity).toBe(2);
    expect(result.proposedDiscountPercent).toBe(10);
    expect(result.discountAmount).toBe(200); // 2000 * 0.10
    expect(result.netLinePrice).toBe(1800);
    expect(result.lineCost).toBe(1200);
    expect(result.lineMarginPercent).toBe(33.33); // ((1800 - 1200) / 1800) * 100
  });

  it('calculates quote aggregate totals accurately', () => {
    const line1 = calculateLinePricing({
      listPrice: 500,
      standardCost: 250,
      quantity: 4,
      proposedDiscountPercent: 5,
    }); // net 1900, cost 1000

    const line2 = calculateLinePricing({
      listPrice: 1000,
      standardCost: 700,
      quantity: 1,
      proposedDiscountPercent: 15,
    }); // net 850, cost 700

    const totals = calculateQuoteTotals([line1, line2]);

    expect(totals.subtotal).toBe(3000); // 2000 + 1000
    expect(totals.totalDiscount).toBe(250); // 100 + 150
    expect(totals.netValue).toBe(2750);
    expect(totals.totalCost).toBe(1700);
    expect(totals.grossMarginPercent).toBe(38.18); // ((2750 - 1700)/2750)*100
  });

  it('evaluates LOW risk when discount <= 10% and margin >= 30%', () => {
    const totals = {
      subtotal: 1000,
      totalDiscount: 50,
      netValue: 950,
      totalCost: 500,
      grossMarginPercent: 47.37,
      avgDiscountPercent: 5,
    };

    const risk = evaluateQuoteRisk(totals);
    expect(risk.riskScore).toBe(1.0);
    expect(risk.riskLevel).toBe('LOW');
    expect(risk.violations).toHaveLength(0);

    const transition = evaluateSubmitTransition(risk);
    expect(transition.targetStatus).toBe('APPROVED');
  });

  it('evaluates HIGH risk requiring FINANCE when margin is below 20%', () => {
    const totals = {
      subtotal: 1000,
      totalDiscount: 300,
      netValue: 700,
      totalCost: 600,
      grossMarginPercent: 14.29,
      avgDiscountPercent: 30,
    };

    const risk = evaluateQuoteRisk(totals);
    expect(risk.riskScore).toBeGreaterThanOrEqual(7.0);
    expect(risk.riskLevel).toBe('HIGH');
    expect(risk.requiredRoles).toContain('FINANCE_OPERATIONS');

    const transition = evaluateSubmitTransition(risk);
    expect(transition.targetStatus).toBe('PENDING_FINANCE');
  });
});
