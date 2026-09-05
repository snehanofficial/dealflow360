import { z } from 'zod';
export const GetRecommendationsParamsSchema = z.object({
    quotationId: z.string().uuid().or(z.string().min(1)),
});
export const AddQuoteLineSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
    proposedDiscountPercent: z.number().min(0).max(100).default(0),
});
export const RecommendationItemSchema = z.object({
    ruleId: z.string(),
    productId: z.string(),
    productName: z.string(),
    sku: z.string(),
    category: z.string(),
    listPrice: z.number(),
    standardCost: z.number(),
    billingType: z.enum(['ONE_TIME', 'RECURRING']),
    recurringPeriod: z.string().nullable().optional(),
    ruleType: z.enum(['CO_PURCHASE', 'PROMOTION', 'CROSS_SELL', 'UPSELL']),
    reason: z.string(),
    priority: z.number(),
    promotionDiscountPercent: z.number().nullable().optional(),
    rankScore: z.number(),
    marginImpact: z.object({
        additionalRevenue: z.number(),
        additionalCost: z.number(),
        additionalMargin: z.number(),
        projectedNetValue: z.number(),
        projectedGrossMarginPercent: z.number(),
        marginDeltaPercent: z.number(),
    }),
});
//# sourceMappingURL=index.js.map