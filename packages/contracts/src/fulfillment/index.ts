import { z } from 'zod';

export const FulfillmentComputeRequestSchema = z.object({
  quoteId: z.string().uuid(),
});

export type FulfillmentComputeRequest = z.infer<typeof FulfillmentComputeRequestSchema>;
