import { z } from 'zod';
export const QuoteIdParamSchema = z.object({
    id: z.string().min(1),
});
//# sourceMappingURL=index.js.map