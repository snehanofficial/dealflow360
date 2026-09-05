export type RuleType = 'CO_PURCHASE' | 'PROMOTION' | 'CROSS_SELL' | 'UPSELL';

export interface ProductDomainModel {
  id: string;
  sku: string;
  name: string;
  category: string;
  listPrice: number;
  standardCost: number;
  billingType: 'ONE_TIME' | 'RECURRING';
  recurringPeriod?: 'MONTHLY' | 'ANNUAL' | null;
  isActive: boolean;
}

export interface RecommendationRuleDomainModel {
  id: string;
  sourceProductId?: string | null;
  recommendedProductId: string;
  ruleType: RuleType;
  reasonTemplate: string;
  priority: number;
  promotionDiscountPercent?: number | null;
  isActive: boolean;
}

export interface QuoteLineDomainModel {
  id: string;
  productId: string;
  quantity: number;
  listPrice: number;
  proposedDiscountPercent: number;
  discountAmount: number;
  netLinePrice: number;
  lineCost: number;
  lineMarginPercent: number;
  product?: ProductDomainModel;
}

export interface QuotationDomainModel {
  id: string;
  quoteNumber: string;
  subtotal: number;
  totalDiscount: number;
  netValue: number;
  grossMarginPercent: number;
  lines: QuoteLineDomainModel[];
}

export interface RecommendationMarginImpact {
  additionalRevenue: number;
  additionalCost: number;
  additionalMargin: number;
  projectedNetValue: number;
  projectedGrossMarginPercent: number;
  marginDeltaPercent: number;
}

export interface RecommendationResult {
  ruleId: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  listPrice: number;
  standardCost: number;
  billingType: 'ONE_TIME' | 'RECURRING';
  recurringPeriod?: string | null;
  ruleType: RuleType;
  reason: string;
  priority: number;
  promotionDiscountPercent?: number | null;
  rankScore: number;
  marginImpact: RecommendationMarginImpact;
}
