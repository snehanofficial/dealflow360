import { describe, it, expect } from 'vitest';
import { calculateRecommendationMarginImpact } from '../recommendationEngine.js';
import { QuotationDomainModel, ProductDomainModel } from '../types.js';

describe('Upsell Margin Integration & Boundary Calculations', () => {
  const baseQuote: QuotationDomainModel = {
    id: 'quote-test-01',
    quoteNumber: 'QT-TEST-001',
    subtotal: 10000,
    totalDiscount: 1000,
    netValue: 9000,
    grossMarginPercent: 33.33, // Cost = 6000
    lines: [],
  };

  const oneTimeHardware: ProductDomainModel = {
    id: 'prod-hw',
    sku: 'SKU-HW',
    name: 'Backup Generator',
    category: 'Hardware',
    listPrice: 3000,
    standardCost: 1800,
    billingType: 'ONE_TIME',
    isActive: true,
  };

  const monthlySaaS: ProductDomainModel = {
    id: 'prod-saas-m',
    sku: 'SKU-SAAS-M',
    name: 'Analytics Pro Monthly',
    category: 'Software',
    listPrice: 100, // $100/month = $1200/yr
    standardCost: 30, // $30/month = $360/yr
    billingType: 'RECURRING',
    recurringPeriod: 'MONTHLY',
    isActive: true,
  };

  const annualSaaS: ProductDomainModel = {
    id: 'prod-saas-a',
    sku: 'SKU-SAAS-A',
    name: 'Security Cloud Annual',
    category: 'Software',
    listPrice: 2000,
    standardCost: 500,
    billingType: 'RECURRING',
    recurringPeriod: 'ANNUAL',
    isActive: true,
  };

  it('computes margin impact for standard one-time product accurately', () => {
    const impact = calculateRecommendationMarginImpact(baseQuote, oneTimeHardware, 10);
    // 10% off $3000 = $2700 revenue
    expect(impact.additionalRevenue).toBe(2700);
    expect(impact.additionalCost).toBe(1800);
    expect(impact.additionalMargin).toBe(900);
    // New total net value = 9000 + 2700 = 11700
    expect(impact.projectedNetValue).toBe(11700);
    // New total cost = 6000 + 1800 = 7800
    // Projected margin = (11700 - 7800)/11700 = 33.33%
    expect(impact.projectedGrossMarginPercent).toBe(33.33);
    expect(impact.marginDeltaPercent).toBe(0);
  });

  it('annualizes monthly recurring product calculations correctly (12x multiplier)', () => {
    const impact = calculateRecommendationMarginImpact(baseQuote, monthlySaaS, 0);
    // $100 * 12 = $1200 annual revenue
    expect(impact.additionalRevenue).toBe(1200);
    // $30 * 12 = $360 annual cost
    expect(impact.additionalCost).toBe(360);
    expect(impact.additionalMargin).toBe(840);
    expect(impact.projectedNetValue).toBe(10200);
    expect(impact.projectedGrossMarginPercent).toBe(37.64);
    expect(impact.marginDeltaPercent).toBe(4.31);
  });


  it('handles annual recurring product calculations (1x multiplier)', () => {
    const impact = calculateRecommendationMarginImpact(baseQuote, annualSaaS, 15);
    // 15% off $2000 = $1700 revenue
    expect(impact.additionalRevenue).toBe(1700);
    expect(impact.additionalCost).toBe(500);
    expect(impact.additionalMargin).toBe(1200);
    expect(impact.projectedNetValue).toBe(10700);
  });

  it('handles 100% promotion discount edge case safely', () => {
    const impact = calculateRecommendationMarginImpact(baseQuote, oneTimeHardware, 100);
    expect(impact.additionalRevenue).toBe(0);
    expect(impact.additionalCost).toBe(1800);
    expect(impact.additionalMargin).toBe(-1800);
    expect(impact.projectedNetValue).toBe(9000);
    // Total cost = 6000 + 1800 = 7800 -> Margin = (9000 - 7800)/9000 = 13.33%
    expect(impact.projectedGrossMarginPercent).toBe(13.33);
    expect(impact.marginDeltaPercent).toBe(-20);
  });

  it('handles $0 net value initial quotation gracefully', () => {
    const emptyQuote: QuotationDomainModel = {
      id: 'quote-empty',
      quoteNumber: 'QT-EMPTY-001',
      subtotal: 0,
      totalDiscount: 0,
      netValue: 0,
      grossMarginPercent: 0,
      lines: [],
    };

    const impact = calculateRecommendationMarginImpact(emptyQuote, oneTimeHardware, 0);
    expect(impact.additionalRevenue).toBe(3000);
    expect(impact.additionalCost).toBe(1800);
    expect(impact.additionalMargin).toBe(1200);
    expect(impact.projectedNetValue).toBe(3000);
    expect(impact.projectedGrossMarginPercent).toBe(40);
    expect(impact.marginDeltaPercent).toBe(40);
  });

  it('handles zero-cost product edge case without error', () => {
    const zeroCostProd: ProductDomainModel = {
      id: 'prod-digital',
      sku: 'SKU-DIGITAL',
      name: 'Digital Manual PDF',
      category: 'Documentation',
      listPrice: 50,
      standardCost: 0,
      billingType: 'ONE_TIME',
      isActive: true,
    };

    const impact = calculateRecommendationMarginImpact(baseQuote, zeroCostProd, 0);
    expect(impact.additionalRevenue).toBe(50);
    expect(impact.additionalCost).toBe(0);
    expect(impact.additionalMargin).toBe(50);
    expect(impact.projectedNetValue).toBe(9050);
    expect(impact.projectedGrossMarginPercent).toBe(33.7);
    expect(impact.marginDeltaPercent).toBe(0.37);
  });
});
