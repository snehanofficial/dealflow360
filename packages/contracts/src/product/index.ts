import { z } from 'zod';

export const ProductCategoryEnum = z.enum([
  'HARDWARE',
  'SOFTWARE_LICENSE',
  'SUBSCRIPTION',
  'PROFESSIONAL_SERVICES',
  'SUPPORT',
]);

export type ProductCategory = z.infer<typeof ProductCategoryEnum>;

export const ProductTypeEnum = z.enum([
  'ONE_TIME',
  'RECURRING',
]);

export type ProductType = z.infer<typeof ProductTypeEnum>;

export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: ProductCategoryEnum,
  type: ProductTypeEnum,
  unitPrice: z.number().positive(),
  costPrice: z.number().nonnegative(),
  maxAllowedDiscount: z.number().min(0).max(100),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductDto = z.infer<typeof ProductSchema>;

export const ProductReferenceSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: ProductCategoryEnum,
  type: ProductTypeEnum,
  unitPrice: z.number(),
  costPrice: z.number(),
  maxAllowedDiscount: z.number(),
});

export type ProductReferenceDto = z.infer<typeof ProductReferenceSchema>;
