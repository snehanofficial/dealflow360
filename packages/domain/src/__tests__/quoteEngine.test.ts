import { describe, it, expect } from 'vitest';
import {
  calculateLinePricing,
  calculateQuoteTotals,
  evaluateQuoteRisk,
  evaluateSubmitTransition,
} from '../quote/quoteEngine.js';

describe('quoteEngine domain logic', () => {
  it('calculates line pricing correctly with default unit price', () => {
    const result = calculateLinePricing({
      listPrice: 1000,
      standardCost: 600,
      quantity: 2,
      proposedDiscountPercent: 10,
    });

    expect(result.listPrice).toBe(1000);
    expect(result.unitPrice).toBe(1000);
    expect(result.quantity).toBe(2);
    expect(result.grossAmount).toBe(2000);
    expect(result.proposedDiscountPercent).toBe(10);
    expect(result.discountAmount).toBe(200); // 2000 * 0.10
    expect(result.taxableAmount).toBe(1800);
    expect(result.taxAmount).toBe(0);
    expect(result.netLinePrice).toBe(1800);
    expect(result.lineCost).toBe(1200);
    expect(result.lineMarginPercent).toBe(33.33); // ((1800 - 1200) / 1800) * 100
  });

  it('allows selling price to be edited lower, equal, higher, and significantly higher without ceiling', () => {
    // Lower
    const lower = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 800,
      standardCost: 400,
      quantity: 1,
      proposedDiscountPercent: 0,
    });
    expect(lower.unitPrice).toBe(800);
    expect(lower.grossAmount).toBe(800);

    // Equal
    const equal = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 1000,
      standardCost: 400,
      quantity: 1,
      proposedDiscountPercent: 0,
    });
    expect(equal.unitPrice).toBe(1000);

    // Higher
    const higher = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 1500,
      standardCost: 400,
      quantity: 1,
      proposedDiscountPercent: 0,
    });
    expect(higher.unitPrice).toBe(1500);

    // Significantly higher
    const significantlyHigher = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 5000,
      standardCost: 400,
      quantity: 1,
      proposedDiscountPercent: 0,
    });
    expect(significantlyHigher.unitPrice).toBe(5000);
    expect(significantlyHigher.grossAmount).toBe(5000);
  });

  it('calculates discount strictly from edited unit price, NOT catalog list price', () => {
    // List price = 1000, unitPrice = 1500, qty = 2, disc = 10%
    const result = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 1500,
      standardCost: 500,
      quantity: 2,
      proposedDiscountPercent: 10,
    });

    expect(result.grossAmount).toBe(3000); // 1500 * 2
    expect(result.discountAmount).toBe(300); // 3000 * 10% (NOT 2000 * 10%)
    expect(result.taxableAmount).toBe(2700); // 3000 - 300
  });

  it('executes MANDATORY acceptance scenario correctly with tax', () => {
    // Acceptance scenario step 1:
    // Default catalog price = ₹1,000, edited selling price = ₹1,500, Qty = 2, Disc = 10%, Tax = 18%
    const step1 = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 1500,
      standardCost: 500,
      quantity: 2,
      proposedDiscountPercent: 10,
      taxRate: 18,
    });

    expect(step1.grossAmount).toBe(3000);
    expect(step1.discountAmount).toBe(300);
    expect(step1.taxableAmount).toBe(2700);
    expect(step1.taxAmount).toBe(486); // 2700 * 18% = 486
    expect(step1.netLinePrice).toBe(3186); // 2700 + 486 = 3186

    const totalsStep1 = calculateQuoteTotals([step1]);
    expect(totalsStep1.subtotal).toBe(3000);
    expect(totalsStep1.totalDiscount).toBe(300);
    expect(totalsStep1.taxableAmount).toBe(2700);
    expect(totalsStep1.taxAmount).toBe(486);
    expect(totalsStep1.netValue).toBe(3186);

    // Acceptance scenario step 2:
    // Change unit price to ₹2,000
    const step2 = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 2000,
      standardCost: 500,
      quantity: 2,
      proposedDiscountPercent: 10,
      taxRate: 18,
    });

    expect(step2.grossAmount).toBe(4000);
    expect(step2.discountAmount).toBe(400);
    expect(step2.taxableAmount).toBe(3600);
    expect(step2.taxAmount).toBe(648); // 3600 * 18% = 648
    expect(step2.netLinePrice).toBe(4248);

    const totalsStep2 = calculateQuoteTotals([step2]);
    expect(totalsStep2.subtotal).toBe(4000);
    expect(totalsStep2.totalDiscount).toBe(400);
    expect(totalsStep2.taxableAmount).toBe(3600);
    expect(totalsStep2.taxAmount).toBe(648);
    expect(totalsStep2.netValue).toBe(4248);
  });

  it('reconciles multi-line quotation totals accurately with tax', () => {
    const line1 = calculateLinePricing({
      listPrice: 500,
      unitPrice: 600,
      standardCost: 250,
      quantity: 4,
      proposedDiscountPercent: 5,
      taxRate: 18,
    }); // gross 2400, disc 120, taxable 2280, tax 410.40, net 2690.40

    const line2 = calculateLinePricing({
      listPrice: 1000,
      unitPrice: 1200,
      standardCost: 700,
      quantity: 1,
      proposedDiscountPercent: 15,
      taxRate: 18,
    }); // gross 1200, disc 180, taxable 1020, tax 183.60, net 1203.60

    const totals = calculateQuoteTotals([line1, line2]);

    expect(totals.subtotal).toBe(3600); // 2400 + 1200
    expect(totals.totalDiscount).toBe(300); // 120 + 180
    expect(totals.taxableAmount).toBe(3300); // 2280 + 1020
    expect(totals.taxAmount).toBe(594); // 410.40 + 183.60
    expect(totals.netValue).toBe(3894); // 2690.40 + 1203.60
  });

  it('evaluates LOW risk when discount <= 10% and margin >= 30%', () => {
    const totals = {
      subtotal: 1000,
      totalDiscount: 50,
      taxableAmount: 950,
      taxAmount: 171,
      netValue: 1121,
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
      taxableAmount: 700,
      taxAmount: 126,
      netValue: 826,
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
