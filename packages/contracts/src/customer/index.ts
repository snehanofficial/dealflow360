import { z } from 'zod';

export const CustomerTierEnum = z.enum([
  'ENTERPRISE',
  'GOLD',
  'SILVER',
  'BRONZE',
]);

export type CustomerTier = z.infer<typeof CustomerTierEnum>;

export const CustomerStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
]);

export type CustomerStatus = z.infer<typeof CustomerStatusEnum>;

export const CustomerSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  tier: CustomerTierEnum,
  status: CustomerStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CustomerDto = z.infer<typeof CustomerSchema>;

export const CreateCustomerSchema = z.object({
  code: z.string().min(2, 'Customer code must be at least 2 characters').max(30),
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  tier: CustomerTierEnum.default('SILVER'),
  status: CustomerStatusEnum.default('ACTIVE'),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().nullable().optional(),
  tier: CustomerTierEnum.optional(),
  status: CustomerStatusEnum.optional(),
});

export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>;

export const CustomerFilterQuerySchema = z.object({
  search: z.string().optional(),
  tier: CustomerTierEnum.optional(),
  status: CustomerStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CustomerFilterQuery = z.infer<typeof CustomerFilterQuerySchema>;

export const CustomerListResponseSchema = z.object({
  items: z.array(CustomerSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type CustomerListResponse = z.infer<typeof CustomerListResponseSchema>;

export const CustomerReferenceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  tier: CustomerTierEnum,
});

export type CustomerReferenceDto = z.infer<typeof CustomerReferenceSchema>;

