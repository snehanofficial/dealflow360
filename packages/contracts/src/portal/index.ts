import { z } from 'zod';

export const PortalTokenParamsSchema = z.object({
  token: z.string().min(1),
});

export type PortalTokenParams = z.infer<typeof PortalTokenParamsSchema>;

export const CreatePortalTokenSchema = z.object({
  quotationId: z.string().min(1),
  expiresInHours: z.number().int().min(1).default(72),
});

export type CreatePortalTokenInput = z.infer<typeof CreatePortalTokenSchema>;

export const CounterOfferLineItemSchema = z.object({
  lineId: z.string().min(1),
  proposedDiscountPercent: z.number().min(0).max(100),
  quantity: z.number().int().min(1).optional(),
});

export const SubmitCounterOfferSchema = z.object({
  proposedDiscountPercent: z.number().min(0).max(100).optional(),
  lineDiscounts: z.array(CounterOfferLineItemSchema).optional().default([]),
  customerNotes: z.string().optional(),
});

export type SubmitCounterOfferInput = z.infer<typeof SubmitCounterOfferSchema>;
