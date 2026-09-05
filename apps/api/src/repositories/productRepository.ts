import { db, Product, BillingType } from '@dealflow360/db';
import { CreateProductRequest, UpdateProductRequest, ProductFilterQuery } from '@dealflow360/contracts';

export class ProductRepository {
  async findBySku(sku: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { sku },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { id },
    });
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return db.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || null,
        category: data.category,
        listPrice: data.unitPrice,
        standardCost: data.costPrice,
        maxAllowedDiscount: data.maxAllowedDiscount,
        billingType: data.type as BillingType,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findMany(query: ProductFilterQuery): Promise<{ items: Product[]; total: number }> {
    const { search, category, type, isActive, page, limit } = query;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (category) {
      whereClause.category = category;
    }

    if (type) {
      whereClause.billingType = type;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where: whereClause }),
    ]);

    return { items, total };
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.type !== undefined) updateData.billingType = data.type;
    if (data.unitPrice !== undefined) updateData.listPrice = data.unitPrice;
    if (data.costPrice !== undefined) updateData.standardCost = data.costPrice;
    if (data.maxAllowedDiscount !== undefined) updateData.maxAllowedDiscount = data.maxAllowedDiscount;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return db.product.update({
      where: { id },
      data: updateData,
    });
  }
}

export const productRepository = new ProductRepository();
