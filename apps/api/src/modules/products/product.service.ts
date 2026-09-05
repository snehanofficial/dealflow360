import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilterQuery,
  ProductListResponse,
  ProductDto,
  ProductReferenceDto,
  ProductCategory,
  ProductType,
} from '@dealflow360/contracts';
import { productRepository } from '../../repositories/productRepository.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Product } from '@dealflow360/db';

function mapToProductDto(product: Product): ProductDto {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description || null,
    category: product.category as ProductCategory,
    type: product.billingType as ProductType,
    unitPrice: product.listPrice,
    costPrice: product.standardCost,
    maxAllowedDiscount: product.maxAllowedDiscount,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function mapToProductReferenceDto(product: Product): ProductReferenceDto {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category as ProductCategory,
    type: product.billingType as ProductType,
    unitPrice: product.listPrice,
    costPrice: product.standardCost,
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

  return {
    items: items.map(mapToProductDto),
    total,
    page: query.page,
    limit: query.limit,
    totalPages,
  };
}

export async function getProductById(id: string): Promise<ProductDto> {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('NOT_FOUND', `Product with ID '${id}' not found.`, 404);
  }

  return mapToProductDto(product);
}

export async function updateProduct(id: string, data: UpdateProductRequest): Promise<ProductDto> {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Product with ID '${id}' not found.`, 404);
  }

  const updated = await productRepository.updateProduct(id, data);
  return mapToProductDto(updated);
}
