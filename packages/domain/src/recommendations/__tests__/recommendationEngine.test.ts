import { describe, it, expect } from 'vitest';
import {
  generateRecommendations,
  calculateRecommendationMarginImpact,
} from '../recommendationEngine.js';
import {
  QuotationDomainModel,
  RecommendationRuleDomainModel,
  ProductDomainModel,
} from '../types.js';

describe('RecommendationEngine', () => {
  const serverProd: ProductDomainModel = {
    id: 'prod-srv',
    sku: 'SKU-SRV',
    name: 'Enterprise Server Pro',
    category: 'Hardware',
    listPrice: 10000,
    standardCost: 6000,
    billingType: 'ONE_TIME',
    isActive: true,
  };

  const upsProd: ProductDomainModel = {
    id: 'prod-ups',
    sku: 'SKU-UPS',
    name: 'UPS Power Backup',
    category: 'Hardware Accessories',
    listPrice: 2500,
    standardCost: 1400,
    billingType: 'ONE_TIME',
    isActive: true,
  };

  const securitySub: ProductDomainModel = {
    id: 'prod-sec',
    sku: 'SKU-SEC',
    name: 'Cloud Security Suite',
    category: 'Software',
    listPrice: 5000,
    standardCost: 1500,
    billingType: 'RECURRING',
    recurringPeriod: 'ANNUAL',
    isActive: true,
  };

  const productsMap = new Map<string, ProductDomainModel>([
    [serverProd.id, serverProd],
    [upsProd.id, upsProd],
    [securitySub.id, securitySub],
  ]);

  const sampleQuote: QuotationDomainModel = {
    id: 'quote-1',
    quoteNumber: 'QT-001',
    subtotal: 10000,
    totalDiscount: 0,
    netValue: 10000,
    grossMarginPercent: 40,
    lines: [
      {
        id: 'line-1',
        productId: serverProd.id,
        quantity: 1,
        listPrice: 10000,
        proposedDiscountPercent: 0,
        discountAmount: 0,
        netLinePrice: 10000,
        lineCost: 6000,
        lineMarginPercent: 40,
      },
    ],
  };

  it('calculates recommendation margin impact correctly', () => {
    const impact = calculateRecommendationMarginImpact(sampleQuote, upsProd, 0);
    expect(impact.additionalRevenue).toBe(2500);
    expect(impact.additionalCost).toBe(1400);
    expect(impact.additionalMargin).toBe(1100);
    expect(impact.projectedNetValue).toBe(12500);
    expect(impact.projectedGrossMarginPercent).toBe(40.8);
    expect(impact.marginDeltaPercent).toBe(0.8);
  });

  it('evaluates co-purchase and promotion rules with ranking', () => {
    const rules: RecommendationRuleDomainModel[] = [
      {
        id: 'rule-1',
        sourceProductId: serverProd.id,
        recommendedProductId: upsProd.id,
        ruleType: 'CO_PURCHASE',
        reasonTemplate: 'Frequently co-purchased with {sourceProduct}',
        priority: 20,
        isActive: true,
      },
      {
        id: 'rule-2',
        sourceProductId: null,
        recommendedProductId: securitySub.id,
        ruleType: 'PROMOTION',
        reasonTemplate: 'Annual Security Promo',
        priority: 30,
        promotionDiscountPercent: 20,
        isActive: true,
      },
    ];

    const recommendations = generateRecommendations(sampleQuote, rules, productsMap);

    expect(recommendations).toHaveLength(2);
    // Promotion rule has higher priority (30) + promo bonus (40) -> rank score higher
    expect(recommendations[0].productId).toBe(securitySub.id);
    expect(recommendations[0].promotionDiscountPercent).toBe(20);
    expect(recommendations[0].marginImpact.additionalRevenue).toBe(4000); // 5000 list price - 20% discount

    expect(recommendations[1].productId).toBe(upsProd.id);
    expect(recommendations[1].reason).toBe('Frequently co-purchased with Enterprise Server Pro');
  });

  it('filters out products already present in quotation', () => {
    const quoteWithUps: QuotationDomainModel = {
      ...sampleQuote,
      lines: [
        ...sampleQuote.lines,
        {
          id: 'line-2',
          productId: upsProd.id,
          quantity: 1,
          listPrice: 2500,
          proposedDiscountPercent: 0,
          discountAmount: 0,
          netLinePrice: 2500,
          lineCost: 1400,
          lineMarginPercent: 44,
        },
      ],
    };

    const rules: RecommendationRuleDomainModel[] = [
      {
        id: 'rule-1',
        sourceProductId: serverProd.id,
        recommendedProductId: upsProd.id,
        ruleType: 'CO_PURCHASE',
        reasonTemplate: 'Co-purchased item',
        priority: 20,
        isActive: true,
      },
    ];

    const recommendations = generateRecommendations(quoteWithUps, rules, productsMap);
    expect(recommendations).toHaveLength(0);
  });
});
