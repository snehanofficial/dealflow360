import { z } from 'zod';

export const BillingTypeSchema = z.enum(['ONE_TIME', 'RECURRING']);
export type BillingType = z.infer<typeof BillingTypeSchema>;

export const RecurringPeriodSchema = z.enum(['MONTHLY', 'ANNUAL']);
export type RecurringPeriod = z.infer<typeof RecurringPeriodSchema>;

export const BillingScheduleQuerySchema = z.object({
  quoteId: z.string(),
});
export type BillingScheduleQuery = z.infer<typeof BillingScheduleQuerySchema>;

export const GenerateBillingScheduleSchema = z.object({
  billingStartDate: z.string().optional(),
});
export type GenerateBillingScheduleInput = z.infer<typeof GenerateBillingScheduleSchema>;

export const BillingLineDtoSchema = z.object({
  id: z.string().optional(),
  quoteLineId: z.string().nullable().optional(),
  productName: z.string(),
  billingType: BillingTypeSchema,
  recurringPeriod: RecurringPeriodSchema.nullable().optional(),
  billingDate: z.string(),
  amount: z.number(),
  proratedDays: z.number().nullable().optional(),
  isProrated: z.boolean().default(false),
  status: z.string().default('PENDING'),
});
export type BillingLineDto = z.infer<typeof BillingLineDtoSchema>;

export const BillingScheduleDtoSchema = z.object({
  id: z.string().optional(),
  quotationId: z.string(),
  totalOneTimeAmount: z.number(),
  totalRecurringMonthly: z.number(),
  totalRecurringAnnual: z.number(),
  billingStartDate: z.string(),
  status: z.string(),
  lines: z.array(BillingLineDtoSchema),
});
export type BillingScheduleDto = z.infer<typeof BillingScheduleDtoSchema>;
