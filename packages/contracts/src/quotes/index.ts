import { z } from 'zod';

export const QuoteIdParamSchema = z.object({
  id: z.string().min(1),
});


export type QuoteIdParam = z.infer<typeof QuoteIdParamSchema>;
