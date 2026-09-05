import { z } from 'zod';

export const FulfillmentComputeRequestSchema = z.object({
  quoteId: z.string().min(1),
});

export type FulfillmentComputeRequest = z.infer<typeof FulfillmentComputeRequestSchema>;

export const FulfillmentOverrideItemSchema = z.object({
  quoteLineId: z.string().min(1),
  warehouseId: z.string().min(1),
  allocatedQuantity: z.number().int().min(0),
});

export const FulfillmentOverrideRequestSchema = z.object({
  overrides: z.array(FulfillmentOverrideItemSchema).min(1),
});

export type FulfillmentOverrideInput = z.infer<typeof FulfillmentOverrideRequestSchema>;
