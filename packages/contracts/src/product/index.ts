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

export const CreateProductSchema = z.object({
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  category: ProductCategoryEnum,
  type: ProductTypeEnum.default('ONE_TIME'),
  unitPrice: z.number().positive('Unit price must be positive'),
  costPrice: z.number().nonnegative('Cost price cannot be negative'),
  maxAllowedDiscount: z.number().min(0, 'Min discount 0%').max(100, 'Max discount 100%').default(15),
  isActive: z.boolean().default(true),
});

export type CreateProductRequest = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
  description: z.string().optional().nullable(),
  category: ProductCategoryEnum.optional(),
  type: ProductTypeEnum.optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  costPrice: z.number().nonnegative('Cost price cannot be negative').optional(),
  maxAllowedDiscount: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;

export const ProductFilterQuerySchema = z.object({
  search: z.string().optional(),
  category: ProductCategoryEnum.optional(),
  type: ProductTypeEnum.optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductFilterQuery = z.infer<typeof ProductFilterQuerySchema>;

export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
