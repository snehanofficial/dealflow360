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

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CategoryDto = z.infer<typeof CategorySchema>;

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  code: z.string().min(2, 'Category code is required'),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;

export const CategoryReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  isPrimary: z.boolean(),
});

export type CategoryReferenceDto = z.infer<typeof CategoryReferenceSchema>;

export const VariantAttributeValueSchema = z.object({
  attributeName: z.string(),
  attributeValue: z.string(),
});

export type VariantAttributeValueDto = z.infer<typeof VariantAttributeValueSchema>;

export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  extraPrice: z.number(),
  isActive: z.boolean(),
  attributes: z.array(VariantAttributeValueSchema).default([]),
});

export type ProductVariantDto = z.infer<typeof ProductVariantSchema>;

export const CreateVariantSchema = z.object({
  sku: z.string().min(2, 'Variant SKU is required'),
  name: z.string().min(2, 'Variant name is required'),
  extraPrice: z.number().default(0),
  attributes: z.array(z.object({
    attributeName: z.string().min(1),
    attributeValue: z.string().min(1),
  })).default([]),
});

export type CreateVariantRequest = z.infer<typeof CreateVariantSchema>;

export const ProductAttributeValueSchema = z.object({
  id: z.string(),
  attributeId: z.string(),
  value: z.string(),
});

export type ProductAttributeValueDto = z.infer<typeof ProductAttributeValueSchema>;

export const ProductAttributeSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(ProductAttributeValueSchema).default([]),
});

export type ProductAttributeDto = z.infer<typeof ProductAttributeSchema>;

export const CreateAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  values: z.array(z.string()).default([]),
});

export type CreateAttributeRequest = z.infer<typeof CreateAttributeSchema>;

export const PriceListEntrySchema = z.object({
  id: z.string(),
  priceListId: z.string(),
  productId: z.string(),
  unitPrice: z.number(),
});

export type PriceListEntryDto = z.infer<typeof PriceListEntrySchema>;

export const PriceListSchema = z.object({
  id: z.string(),
  name: z.string(),
  customerTier: z.string().nullable().optional(),
  currency: z.string().default('USD'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  entries: z.array(PriceListEntrySchema).optional(),
});

export type PriceListDto = z.infer<typeof PriceListSchema>;

export const CreatePriceListSchema = z.object({
  name: z.string().min(2, 'Price list name is required'),
  customerTier: z.enum(['ENTERPRISE', 'TIER_1', 'TIER_2', 'TIER_3']).optional().nullable(),
  currency: z.string().default('USD'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  entries: z.array(z.object({
    productId: z.string(),
    unitPrice: z.number().positive(),
  })).optional(),
});

export type CreatePriceListRequest = z.infer<typeof CreatePriceListSchema>;

export const UpdatePriceListSchema = z.object({
  name: z.string().min(2).optional(),
  customerTier: z.enum(['ENTERPRISE', 'TIER_1', 'TIER_2', 'TIER_3']).optional().nullable(),
  currency: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePriceListRequest = z.infer<typeof UpdatePriceListSchema>;

export const UpsertPriceListEntrySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  unitPrice: z.number().positive('Price must be positive'),
});

export type UpsertPriceListEntryRequest = z.infer<typeof UpsertPriceListEntrySchema>;

export const AddAttributeValueSchema = z.object({
  value: z.string().min(1, 'Attribute value is required'),
});

export type AddAttributeValueRequest = z.infer<typeof AddAttributeValueSchema>;

export const UpdateVariantSchema = z.object({
  sku: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  extraPrice: z.number().optional(),
  isActive: z.boolean().optional(),
  attributeValueIds: z.array(z.string()).optional(),
});

export type UpdateVariantRequest = z.infer<typeof UpdateVariantSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: ProductCategoryEnum,
  primaryCategory: CategoryReferenceSchema.optional(),
  categories: z.array(CategoryReferenceSchema).default([]),
  type: ProductTypeEnum,
  unit: z.string().default('Unit'),
  taxRate: z.number().min(0).max(100).default(0),
  unitPrice: z.number().positive(),
  costPrice: z.number().nonnegative(),
  maxAllowedDiscount: z.number().min(0).max(100),
  isActive: z.boolean(),
  variants: z.array(ProductVariantSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductDto = z.infer<typeof ProductSchema>;

export const ProductReferenceSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: ProductCategoryEnum,
  primaryCategory: CategoryReferenceSchema.optional(),
  categories: z.array(CategoryReferenceSchema).default([]),
  type: ProductTypeEnum,
  unit: z.string().default('Unit'),
  taxRate: z.number().default(0),
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
  additionalCategoryIds: z.array(z.string()).optional(),
  type: ProductTypeEnum.default('ONE_TIME'),
  unit: z.string().default('Unit'),
  taxRate: z.number().min(0).max(100).default(0),
  unitPrice: z.number().positive('Unit price must be positive'),
  costPrice: z.number().nonnegative('Cost price cannot be negative'),
  maxAllowedDiscount: z.number().min(0, 'Min discount 0%').max(100, 'Max discount 100%').default(15),
  isActive: z.boolean().default(true),
  variants: z.array(CreateVariantSchema).optional(),
});

export type CreateProductRequest = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
  description: z.string().optional().nullable(),
  category: ProductCategoryEnum.optional(),
  additionalCategoryIds: z.array(z.string()).optional(),
  type: ProductTypeEnum.optional(),
  unit: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  costPrice: z.number().nonnegative('Cost price cannot be negative').optional(),
  maxAllowedDiscount: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;

export const ProductFilterQuerySchema = z.object({
  search: z.string().optional(),
  category: ProductCategoryEnum.optional(),
  categoryIds: z.string().optional(),
  type: ProductTypeEnum.optional(),
  tier: z.string().optional(),
  currency: z.string().optional(),
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
