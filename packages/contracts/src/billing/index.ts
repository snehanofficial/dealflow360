import { z } from 'zod';

export const BillingScheduleQuerySchema = z.object({
  quoteId: z.string().uuid(),
});

export type BillingScheduleQuery = z.infer<typeof BillingScheduleQuerySchema>;
