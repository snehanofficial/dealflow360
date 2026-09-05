import { z } from 'zod';

export const InvoiceStatusSchema = z.enum(['DRAFT', 'ISSUED', 'PAID', 'VOID']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const CreateInvoiceSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  status: InvoiceStatusSchema.optional().default('ISSUED'),
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export const InvoiceQuerySchema = z.object({
  status: InvoiceStatusSchema.optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
});
export type InvoiceQuery = z.infer<typeof InvoiceQuerySchema>;

export const InvoiceLineDtoSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  productId: z.string().nullable().optional(),
  productName: z.string(),
  productSku: z.string(),
  quantity: z.number(),
  listPrice: z.number(),
  unitPrice: z.number(),
  proposedDiscountPercent: z.number(),
  discountAmount: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  taxableAmount: z.number(),
  lineTotal: z.number(),
});
export type InvoiceLineDto = z.infer<typeof InvoiceLineDtoSchema>;

export const InvoiceDtoSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  quotationId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string().nullable().optional(),
  customerTier: z.string(),
  customerRegion: z.string(),
  status: InvoiceStatusSchema,
  issueDate: z.string(),
  dueDate: z.string().nullable().optional(),
  subtotal: z.number(),
  totalDiscount: z.number(),
  taxableAmount: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),
  notes: z.string().nullable().optional(),
  createdById: z.string().nullable().optional(),
  quotation: z.object({ id: z.string(), quoteNumber: z.string() }).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lines: z.array(InvoiceLineDtoSchema).optional(),
});
export type InvoiceDto = z.infer<typeof InvoiceDtoSchema>;
