import { z } from 'zod';
export declare const FulfillmentComputeRequestSchema: z.ZodObject<{
    quoteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quoteId: string;
}, {
    quoteId: string;
}>;
export type FulfillmentComputeRequest = z.infer<typeof FulfillmentComputeRequestSchema>;
//# sourceMappingURL=index.d.ts.map