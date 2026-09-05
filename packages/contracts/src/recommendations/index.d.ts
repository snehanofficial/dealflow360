import { z } from 'zod';
export declare const GetRecommendationsParamsSchema: z.ZodObject<{
    quotationId: z.ZodUnion<[z.ZodString, z.ZodString]>;
}, "strip", z.ZodTypeAny, {
    quotationId: string;
}, {
    quotationId: string;
}>;
export type GetRecommendationsParams = z.infer<typeof GetRecommendationsParamsSchema>;
export declare const AddQuoteLineSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    proposedDiscountPercent: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    proposedDiscountPercent: number;
}, {
    productId: string;
    quantity?: number | undefined;
    proposedDiscountPercent?: number | undefined;
}>;
export type AddQuoteLineInput = z.infer<typeof AddQuoteLineSchema>;
export declare const RecommendationItemSchema: z.ZodObject<{
    ruleId: z.ZodString;
    productId: z.ZodString;
    productName: z.ZodString;
    sku: z.ZodString;
    category: z.ZodString;
    listPrice: z.ZodNumber;
    standardCost: z.ZodNumber;
    billingType: z.ZodEnum<["ONE_TIME", "RECURRING"]>;
    recurringPeriod: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ruleType: z.ZodEnum<["CO_PURCHASE", "PROMOTION", "CROSS_SELL", "UPSELL"]>;
    reason: z.ZodString;
    priority: z.ZodNumber;
    promotionDiscountPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rankScore: z.ZodNumber;
    marginImpact: z.ZodObject<{
        additionalRevenue: z.ZodNumber;
        additionalCost: z.ZodNumber;
        additionalMargin: z.ZodNumber;
        projectedNetValue: z.ZodNumber;
        projectedGrossMarginPercent: z.ZodNumber;
        marginDeltaPercent: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        additionalRevenue: number;
        additionalCost: number;
        additionalMargin: number;
        projectedNetValue: number;
        projectedGrossMarginPercent: number;
        marginDeltaPercent: number;
    }, {
        additionalRevenue: number;
        additionalCost: number;
        additionalMargin: number;
        projectedNetValue: number;
        projectedGrossMarginPercent: number;
        marginDeltaPercent: number;
    }>;
}, "strip", z.ZodTypeAny, {
    category: string;
    productId: string;
    priority: number;
    ruleId: string;
    sku: string;
    productName: string;
    listPrice: number;
    standardCost: number;
    billingType: "ONE_TIME" | "RECURRING";
    ruleType: "CO_PURCHASE" | "PROMOTION" | "CROSS_SELL" | "UPSELL";
    reason: string;
    rankScore: number;
    marginImpact: {
        additionalRevenue: number;
        additionalCost: number;
        additionalMargin: number;
        projectedNetValue: number;
        projectedGrossMarginPercent: number;
        marginDeltaPercent: number;
    };
    recurringPeriod?: string | null | undefined;
    promotionDiscountPercent?: number | null | undefined;
}, {
    category: string;
    productId: string;
    priority: number;
    ruleId: string;
    sku: string;
    productName: string;
    listPrice: number;
    standardCost: number;
    billingType: "ONE_TIME" | "RECURRING";
    ruleType: "CO_PURCHASE" | "PROMOTION" | "CROSS_SELL" | "UPSELL";
    reason: string;
    rankScore: number;
    marginImpact: {
        additionalRevenue: number;
        additionalCost: number;
        additionalMargin: number;
        projectedNetValue: number;
        projectedGrossMarginPercent: number;
        marginDeltaPercent: number;
    };
    recurringPeriod?: string | null | undefined;
    promotionDiscountPercent?: number | null | undefined;
}>;
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;
//# sourceMappingURL=index.d.ts.map