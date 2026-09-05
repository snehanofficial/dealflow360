import { z } from 'zod';
export declare const ApprovalDecisionSchema: z.ZodObject<{
    comments: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    comments?: string | undefined;
}, {
    comments?: string | undefined;
}>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
//# sourceMappingURL=index.d.ts.map