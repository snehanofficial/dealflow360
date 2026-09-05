import { z } from 'zod';
export const BillingScheduleQuerySchema = z.object({
    quoteId: z.string().uuid(),
});
//# sourceMappingURL=index.js.map