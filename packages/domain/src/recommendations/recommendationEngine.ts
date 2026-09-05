import {
  QuotationDomainModel,
  RecommendationRuleDomainModel,
  ProductDomainModel,
  RecommendationResult,
  RecommendationMarginImpact,
} from './types.js';

export function calculateRecommendationMarginImpact(
  quotation: QuotationDomainModel,
  product: ProductDomainModel,
  promotionDiscountPercent: number = 0,
): RecommendationMarginImpact {
  const discount = Math.min(Math.max(promotionDiscountPercent, 0), 100);
  const additionalRevenue = Math.round(product.listPrice * (1 - discount / 100) * 100) / 100;
  const additionalCost = Math.round(product.standardCost * 100) / 100;
  const additionalMargin = Math.round((additionalRevenue - additionalCost) * 100) / 100;

  const currentNetValue = quotation.netValue || 0;
  const currentMarginDecimal = (quotation.grossMarginPercent || 0) / 100;
  const currentCost = currentNetValue * (1 - currentMarginDecimal);

  const projectedNetValue = Math.round((currentNetValue + additionalRevenue) * 100) / 100;
  const projectedTotalCost = currentCost + additionalCost;

  let projectedGrossMarginPercent = 0;
  if (projectedNetValue > 0) {
    projectedGrossMarginPercent =
      Math.round(((projectedNetValue - projectedTotalCost) / projectedNetValue) * 10000) / 100;
  }

  const marginDeltaPercent =
    Math.round((projectedGrossMarginPercent - quotation.grossMarginPercent) * 100) / 100;

  return {
    additionalRevenue,
    additionalCost,
    additionalMargin,
    projectedNetValue,
    projectedGrossMarginPercent,
    marginDeltaPercent,
  };
}

export function generateRecommendations(
  quotation: QuotationDomainModel,
  rules: RecommendationRuleDomainModel[],
  productsById: Map<string, ProductDomainModel>,
): RecommendationResult[] {
  const existingProductIds = new Set(quotation.lines.map((line) => line.productId));
  const results: RecommendationResult[] = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    // Filter out if recommended product is already in the quote
    if (existingProductIds.has(rule.recommendedProductId)) continue;

    // Match rule condition:
    // If sourceProductId is specified, quotation must contain that source product line
    if (rule.sourceProductId && !existingProductIds.has(rule.sourceProductId)) {
      continue;
    }

    const recommendedProduct = productsById.get(rule.recommendedProductId);
    if (!recommendedProduct || !recommendedProduct.isActive) continue;

    const sourceProduct = rule.sourceProductId
      ? productsById.get(rule.sourceProductId)
      : null;

    // Reason formatting
    let reason = rule.reasonTemplate;
    if (sourceProduct && reason.includes('{sourceProduct}')) {
      reason = reason.replace('{sourceProduct}', sourceProduct.name);
    }

    const promotionPercent = rule.promotionDiscountPercent || 0;
    const marginImpact = calculateRecommendationMarginImpact(
      quotation,
      recommendedProduct,
      promotionPercent,
    );

    // Deterministic Ranking Score formula:
    // priority * 10 + promo bonus + commercial value score + margin delta score
    const baseScore = rule.priority * 10;
    const promoBonus = promotionPercent > 0 ? promotionPercent * 2 : 0;
    const valueBonus = Math.min(recommendedProduct.listPrice / 1000, 20);
    const marginBonus = Math.max(marginImpact.additionalMargin / 1000, 0);

    const rankScore = Math.round((baseScore + promoBonus + valueBonus + marginBonus) * 100) / 100;

    results.push({
      ruleId: rule.id,
      productId: recommendedProduct.id,
      productName: recommendedProduct.name,
      sku: recommendedProduct.sku,
      category: recommendedProduct.category,
      listPrice: recommendedProduct.listPrice,
      standardCost: recommendedProduct.standardCost,
      billingType: recommendedProduct.billingType,
      recurringPeriod: recommendedProduct.recurringPeriod,
      ruleType: rule.ruleType,
      reason,
      priority: rule.priority,
      promotionDiscountPercent: rule.promotionDiscountPercent,
      rankScore,
      marginImpact,
    });
  }

  // Sort descending by rankScore
  return results.sort((a, b) => b.rankScore - a.rankScore);
}
