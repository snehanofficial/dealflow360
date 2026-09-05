import { z } from 'zod';
export declare const BillingScheduleQuerySchema: z.ZodObject<{
    quoteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quoteId: string;
}, {
    quoteId: string;
}>;
export type BillingScheduleQuery = z.infer<typeof BillingScheduleQuerySchema>;
//# sourceMappingURL=index.d.ts.map