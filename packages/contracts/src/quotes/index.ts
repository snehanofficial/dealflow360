import { z } from 'zod';

export const QuoteIdParamSchema = z.object({
  id: z.string().min(1),
});

export type QuoteIdParam = z.infer<typeof QuoteIdParamSchema>;

export const QuoteLineParamsSchema = z.object({
  id: z.string().min(1),
  lineId: z.string().min(1),
});

export type QuoteLineParams = z.infer<typeof QuoteLineParamsSchema>;

export const CreateQuoteLineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  proposedDiscountPercent: z.number().min(0).max(100).default(0),
});

export const CreateQuoteSchema = z.object({
  customerId: z.string().min(1),
  quoteNumber: z.string().optional(),
  initialLines: z.array(CreateQuoteLineItemSchema).optional().default([]),
});

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;

export const UpdateQuoteLineSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  proposedDiscountPercent: z.number().min(0).max(100).optional(),
});

export type UpdateQuoteLineInput = z.infer<typeof UpdateQuoteLineSchema>;

export const ListQuotesQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  customerId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListQuotesQuery = z.infer<typeof ListQuotesQuerySchema>;

export const SubmitQuoteSchema = z.object({
  notes: z.string().optional(),
});

export type SubmitQuoteInput = z.infer<typeof SubmitQuoteSchema>;

