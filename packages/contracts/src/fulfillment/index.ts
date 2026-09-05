import { z } from 'zod';

export const WarehouseCreateSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  location: z.string().min(2),
  priority: z.number().int().min(1).default(10),
  isActive: z.boolean().default(true),
});

export type WarehouseCreateInput = z.infer<typeof WarehouseCreateSchema>;

export const WarehouseUpdateSchema = z.object({
  code: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().min(2).optional(),
  priority: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type WarehouseUpdateInput = z.infer<typeof WarehouseUpdateSchema>;

export const InventoryAdjustmentSchema = z.object({
  warehouseId: z.string().min(1),
  productId: z.string().min(1),
  productVariantId: z.string().optional(),
  quantity: z.number().int(), // Positive for receipt/addition, negative for deduction
  movementType: z.enum([
    'RECEIPT',
    'RESERVATION',
    'RESERVATION_RELEASE',
    'SHIPMENT',
    'RETURN',
    'ADJUSTMENT',
    'TRANSFER_IN',
    'TRANSFER_OUT',
  ]).default('RECEIPT'),
  reason: z.string().optional(),
});

export type InventoryAdjustmentInput = z.infer<typeof InventoryAdjustmentSchema>;

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
  overrideReason: z.string().optional(),
});

export type FulfillmentOverrideInput = z.infer<typeof FulfillmentOverrideRequestSchema>;

export const FulfillmentConfirmAllocationItemSchema = z.object({
  quoteLineId: z.string().min(1),
  warehouseId: z.string().min(1),
  allocatedQuantity: z.number().int().min(0),
  backorderedQuantity: z.number().int().min(0).default(0),
  explanation: z.any().optional(),
});

export const FulfillmentConfirmRequestSchema = z.object({
  allocations: z.array(FulfillmentConfirmAllocationItemSchema),
  isOverride: z.boolean().default(false),
  overrideReason: z.string().optional(),
});

export type FulfillmentConfirmInput = z.infer<typeof FulfillmentConfirmRequestSchema>;

export const BackorderConfirmReallocationSchema = z.object({
  warehouseId: z.string().min(1),
  reallocateQuantity: z.number().int().min(1),
  notes: z.string().optional(),
});

export type BackorderConfirmReallocationInput = z.infer<typeof BackorderConfirmReallocationSchema>;

