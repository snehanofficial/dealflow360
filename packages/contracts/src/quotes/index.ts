import { z } from 'zod';

export const QuoteIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type QuoteIdParam = z.infer<typeof QuoteIdParamSchema>;
