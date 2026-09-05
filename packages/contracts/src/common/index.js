import { z } from 'zod';
export const ApiResponseSchema = (dataSchema) => z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
        .object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    })
        .optional(),
});
export { PolicyViolationSchema, CommercialEvaluationSchema, } from '../policy/index.js';
//# sourceMappingURL=index.js.map