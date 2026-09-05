import { describe, it, expect } from 'vitest';
import { evaluateCommercialDeal, matchApplicablePolicyRule } from '../policyEvaluator.js';
import { DiscountPolicyRuleDto } from '@dealflow360/contracts';

describe('policyEngine', () => {
  const sampleRules: DiscountPolicyRuleDto[] = [
    {
      id: 'rule-ent-001',
      name: 'Enterprise Tier Discount Policy',
      description: null,
      customerTier: 'ENTERPRISE',
      category: null,
      productId: null,
      maxDiscountPercent: 20.0,
      minMarginPercent: 20.0,
      requiredApprovalRole: 'SALES_MANAGER',
      priority: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule-t2-001',
      name: 'Tier 2 Customer Policy',
      description: null,
      customerTier: 'TIER_2',
      category: null,
      productId: null,
      maxDiscountPercent: 10.0,
      minMarginPercent: 30.0,
      requiredApprovalRole: 'SALES_MANAGER',
      priority: 30,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rule-hw-001',
      name: 'Hardware Category Margin Protection Policy',
      description: null,
      customerTier: null,
      category: 'Hardware',
      productId: null,
      maxDiscountPercent: 12.0,
      minMarginPercent: 25.0,
      requiredApprovalRole: 'FINANCE_OPERATIONS',
      priority: 60,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('matches rules by specificity (Category + Tier over Global)', () => {
    const product = {
      id: 'prod-1',
      sku: 'SKU-HW-1',
      name: 'Server Rack',
      category: 'Hardware',
      maxAllowedDiscount: 15,
      costPrice: 500,
    };

    const matched = matchApplicablePolicyRule(product, 'ENTERPRISE', sampleRules);
    expect(matched?.id).toBe('rule-hw-001'); // Category specificity score (100) > Tier specificity score (10)
  });

  it('evaluates valid compliant deal without violations or required approvals', () => {
    const deal = evaluateCommercialDeal({
      customerTier: 'ENTERPRISE',
      activeRules: sampleRules,
      lines: [
        {
          product: {
            id: 'prod-1',
            sku: 'SKU-SRV-1',
            name: 'Enterprise Server',
            category: 'Hardware',
            maxAllowedDiscount: 15,
            costPrice: 6000,
          },
          quantity: 2,
          effectiveUnitPrice: 10000,
          proposedDiscountPercent: 5,
        },
      ],
    });

    expect(deal.netTotal).toBe(19000);
    expect(deal.marginPercentage).toBe(36.84);
    expect(deal.violations).toHaveLength(0);
    expect(deal.requiresApproval).toBe(false);
    expect(deal.riskLevel).toBe('LOW');
  });

  it('detects discount limit policy violations and routes to Sales Manager', () => {
    const deal = evaluateCommercialDeal({
      customerTier: 'TIER_2',
      activeRules: sampleRules,
      lines: [
        {
          product: {
            id: 'prod-2',
            sku: 'SKU-SFT-1',
            name: 'Software License',
            category: 'Software',
            maxAllowedDiscount: 25,
            costPrice: 200,
          },
          quantity: 1,
          effectiveUnitPrice: 1000,
          proposedDiscountPercent: 15, // TIER_2 max allowed is 10%
        },
      ],
    });

    expect(deal.violations).toHaveLength(1);
    expect(deal.violations[0].violatedField).toBe('MAX_DISCOUNT');
    expect(deal.requiresApproval).toBe(true);
    expect(deal.requiredApprovalRoles).toContain('SALES_MANAGER');
  });

  it('detects margin policy violations and routes to Finance Operations', () => {
    const deal = evaluateCommercialDeal({
      customerTier: 'ENTERPRISE',
      activeRules: sampleRules,
      lines: [
        {
          product: {
            id: 'prod-3',
            sku: 'SKU-HW-LOW-MARGIN',
            name: 'Low Margin Hardware',
            category: 'Hardware',
            maxAllowedDiscount: 30,
            costPrice: 850,
          },
          quantity: 1,
          effectiveUnitPrice: 1000,
          proposedDiscountPercent: 20, // Net 800, Cost 850 -> negative margin (-6.25%)
        },
      ],
    });

    expect(deal.violations.length).toBeGreaterThan(0);
    expect(deal.requiresApproval).toBe(true);
    expect(deal.requiredApprovalRoles).toContain('FINANCE_OPERATIONS');
  });
});
