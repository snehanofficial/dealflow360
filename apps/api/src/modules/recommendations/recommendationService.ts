import { db } from '@dealflow360/db';
import {
  generateRecommendations,
  QuotationDomainModel,
  RecommendationRuleDomainModel,
  ProductDomainModel,
  RecommendationResult,
} from '@dealflow360/domain';
import { quoteService } from '../quotes/quoteService.js';

export class RecommendationService {
  async getRecommendationsForQuotation(
    quotationId: string,
  ): Promise<RecommendationResult[]> {
    const quotation = await quoteService.getQuotationById(quotationId);

    if (!quotation) {
      throw new Error(`Quotation with ID ${quotationId} not found`);
    }

    // Map quotation to domain model
    const quotationDomain: QuotationDomainModel = {
      id: quotation.id,
      quoteNumber: quotation.quoteNumber,
      subtotal: quotation.subtotal,
      totalDiscount: quotation.totalDiscount,
      netValue: quotation.netValue,
      grossMarginPercent: quotation.grossMarginPercent,
      lines: quotation.lines.map((line: any) => ({
        id: line.id,
        productId: line.productId,
        quantity: line.quantity,
        listPrice: line.listPrice,
        proposedDiscountPercent: line.proposedDiscountPercent,
        discountAmount: line.discountAmount,
        netLinePrice: line.netLinePrice,
        lineCost: line.lineCost,
        lineMarginPercent: line.lineMarginPercent,
      })),
    };

    // Fetch active rules from DB
    const dbRules = await db.recommendationRule.findMany({
      where: { isActive: true },
    });

    const rulesDomain: RecommendationRuleDomainModel[] = dbRules.map((r) => ({
      id: r.id,
      sourceProductId: r.sourceProductId,
      recommendedProductId: r.recommendedProductId,
      ruleType: r.ruleType as any,
      reasonTemplate: r.reasonTemplate,
      priority: r.priority,
      promotionDiscountPercent: r.promotionDiscountPercent,
      isActive: r.isActive,
    }));

    // Fetch all active products
    const dbProducts = await db.product.findMany({
      where: { isActive: true },
    });

    const productsMap = new Map<string, ProductDomainModel>();
    for (const p of dbProducts) {
      productsMap.set(p.id, {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        listPrice: p.listPrice,
        standardCost: p.standardCost,
        billingType: p.billingType as any,
        recurringPeriod: p.recurringPeriod as any,
        isActive: p.isActive,
      });
    }

    return generateRecommendations(quotationDomain, rulesDomain, productsMap);
  }
}

export const recommendationService = new RecommendationService();
