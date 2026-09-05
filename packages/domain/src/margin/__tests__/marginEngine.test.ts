import { describe, it, expect } from 'vitest';
import { calculateLineMargin, calculateDealTotals } from '../marginEngine.js';

describe('marginEngine', () => {
  it('calculates line margins accurately for standard pricing and discount', () => {
    const result = calculateLineMargin({
      quantity: 5,
      effectiveUnitPrice: 1000,
      proposedDiscountPercent: 10,
      unitCost: 600,
    });

    expect(result.lineSubtotal).toBe(5000);
    expect(result.discountAmount).toBe(500);
    expect(result.netLineTotal).toBe(4500);
    expect(result.netUnitPrice).toBe(900);
    expect(result.totalCost).toBe(3000);
    expect(result.marginAmount).toBe(1500);
    expect(result.marginPercentage).toBe(33.33);
  });

  it('handles 0% discount correctly', () => {
    const result = calculateLineMargin({
      quantity: 2,
      effectiveUnitPrice: 500,
      proposedDiscountPercent: 0,
      unitCost: 300,
    });

    expect(result.discountAmount).toBe(0);
    expect(result.netLineTotal).toBe(1000);
    expect(result.marginAmount).toBe(400);
    expect(result.marginPercentage).toBe(40);
  });

  it('handles zero cost edge cases without breaking', () => {
    const result = calculateLineMargin({
      quantity: 1,
      effectiveUnitPrice: 100,
      proposedDiscountPercent: 20,
      unitCost: 0,
    });

    expect(result.netLineTotal).toBe(80);
    expect(result.totalCost).toBe(0);
    expect(result.marginAmount).toBe(80);
    expect(result.marginPercentage).toBe(100);
  });

  it('handles zero price edge cases without division by zero', () => {
    const result = calculateLineMargin({
      quantity: 1,
      effectiveUnitPrice: 0,
      proposedDiscountPercent: 0,
      unitCost: 50,
    });

    expect(result.netLineTotal).toBe(0);
    expect(result.totalCost).toBe(50);
    expect(result.marginAmount).toBe(-50);
    expect(result.marginPercentage).toBe(-100);
  });

  it('aggregates deal totals correctly across multiple lines', () => {
    const line1 = calculateLineMargin({
      quantity: 2,
      effectiveUnitPrice: 1000,
      proposedDiscountPercent: 10,
      unitCost: 600,
    });
    const line2 = calculateLineMargin({
      quantity: 1,
      effectiveUnitPrice: 5000,
      proposedDiscountPercent: 5,
      unitCost: 3000,
    });

    const dealTotals = calculateDealTotals([line1, line2]);

    expect(dealTotals.subtotal).toBe(7000);
    expect(dealTotals.totalDiscount).toBe(450); // 200 + 250
    expect(dealTotals.netTotal).toBe(6550); // 1800 + 4750
    expect(dealTotals.totalCost).toBe(4200); // 1200 + 3000
    expect(dealTotals.marginAmount).toBe(2350);
    expect(dealTotals.marginPercentage).toBe(35.88);
  });
});
