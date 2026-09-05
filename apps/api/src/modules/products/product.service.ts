import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilterQuery,
  ProductListResponse,
  ProductDto,
  ProductReferenceDto,
  ProductCategory,
  ProductType,
  CategoryReferenceDto,
  ProductVariantDto,
} from '@dealflow360/contracts';
import { productRepository } from '../../repositories/productRepository.js';
import { priceListRepository } from '../../repositories/priceListRepository.js';
import { AppError } from '../../middleware/errorHandler.js';
import { CustomerTier } from '@dealflow360/db';

export const roundMoney = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;

function mapCategories(rawCategories: any[]): CategoryReferenceDto[] {
  if (!rawCategories || rawCategories.length === 0) return [];
  return rawCategories.map((c) => ({
    id: c.category.id,
    name: c.category.name,
    code: c.category.code,
    isPrimary: !!c.isPrimary,
  }));
}

function mapPrimaryCategory(rawCategories: any[], legacyCategory: string): CategoryReferenceDto {
  const primary = rawCategories?.find((c) => c.isPrimary);
  if (primary) {
    return {
      id: primary.category.id,
      name: primary.category.name,
      code: primary.category.code,
      isPrimary: true,
    };
  }

  return {
    id: `cat-${legacyCategory.toLowerCase()}`,
    name: legacyCategory.replace('_', ' '),
    code: legacyCategory,
    isPrimary: true,
  };
}

function mapVariants(rawVariants: any[]): ProductVariantDto[] {
  if (!rawVariants || rawVariants.length === 0) return [];
  return rawVariants.map((v) => ({
    id: v.id,
    productId: v.productId,
    sku: v.sku,
    name: v.name,
    extraPrice: roundMoney(v.extraPrice),
    isActive: v.isActive,
    attributes: v.attributes
      ? v.attributes.map((a: any) => ({
          attributeName: a.attributeValue?.attribute?.name || 'Attribute',
          attributeValue: a.attributeValue?.value || '',
        }))
      : [],
  }));
}

function mapToProductDto(product: any, effectiveUnitPrice?: number): ProductDto {
  const categories = mapCategories(product.categories);
  const primaryCategory = mapPrimaryCategory(product.categories, product.category);
  const finalUnitPrice = effectiveUnitPrice !== undefined ? roundMoney(effectiveUnitPrice) : roundMoney(product.listPrice);

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description || null,
    category: product.category as ProductCategory,
    primaryCategory,
    categories,
    type: product.billingType as ProductType,
    unit: product.unit || 'Unit',
    taxRate: product.taxRate ?? 0,
    unitPrice: finalUnitPrice,
    costPrice: roundMoney(product.standardCost),
    maxAllowedDiscount: product.maxAllowedDiscount,
    isActive: product.isActive,
    variants: mapVariants(product.variants),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function mapToProductReferenceDto(product: any, effectiveUnitPrice?: number): ProductReferenceDto {
  const categories = mapCategories(product.categories);
  const primaryCategory = mapPrimaryCategory(product.categories, product.category);
  const finalUnitPrice = effectiveUnitPrice !== undefined ? roundMoney(effectiveUnitPrice) : roundMoney(product.listPrice);

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category as ProductCategory,
    primaryCategory,
    categories,
    type: product.billingType as ProductType,
    unit: product.unit || 'Unit',
    taxRate: product.taxRate ?? 0,
    unitPrice: finalUnitPrice,
    costPrice: roundMoney(product.standardCost),
    maxAllowedDiscount: product.maxAllowedDiscount,
  };
}

export async function createProduct(data: CreateProductRequest): Promise<ProductDto> {
  const existingSku = await productRepository.findBySku(data.sku);
  if (existingSku) {
    throw new AppError('DUPLICATE_SKU', `Product with SKU '${data.sku}' already exists.`, 409);
  }

  const product = await productRepository.createProduct(data);
  return mapToProductDto(product);
}

export async function getProducts(query: ProductFilterQuery): Promise<ProductListResponse> {
  const { items, total } = await productRepository.findMany(query);
  const totalPages = Math.ceil(total / query.limit) || 1;

  // Resolve effective pricing for each product if tier or currency query provided
  const mappedItems = await Promise.all(
    items.map(async (p) => {
      if (query.tier || query.currency) {
        const effectivePrice = await priceListRepository.findEffectivePriceEntry(
          p.id,
          query.tier as CustomerTier,
          query.currency || 'USD',
        );
        return mapToProductDto(p, effectivePrice ?? undefined);
      }
      return mapToProductDto(p);
    }),
  );

  return {
    items: mappedItems,
    total,
    page: query.page,
    limit: query.limit,
    totalPages,
  };
}

export async function getProductById(
  id: string,
  tier?: string,
  currency?: string,
): Promise<ProductDto> {
  const product = await productRepository.findByIdWithDetails(id);
  if (!product) {
    throw new AppError('NOT_FOUND', `Product with ID '${id}' not found.`, 404);
  }

  let effectivePrice: number | undefined;
  if (tier || currency) {
    const foundPrice = await priceListRepository.findEffectivePriceEntry(
      id,
      tier as CustomerTier,
      currency || 'USD',
    );
    if (foundPrice !== null) {
      effectivePrice = foundPrice;
    }
  }

  return mapToProductDto(product, effectivePrice);
}

export async function updateProduct(id: string, data: UpdateProductRequest): Promise<ProductDto> {
  const existing = await productRepository.findByIdWithDetails(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Product with ID '${id}' not found.`, 404);
  }

  const updated = await productRepository.updateProduct(id, data);
  return mapToProductDto(updated);
}
