import { z } from 'zod';
export const FulfillmentComputeRequestSchema = z.object({
    quoteId: z.string().uuid(),
});
//# sourceMappingURL=index.js.map