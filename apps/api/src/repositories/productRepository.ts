import { db, Product, BillingType, ProductCategory, Category, ProductVariant } from '@dealflow360/db';
import { CreateProductRequest, UpdateProductRequest, ProductFilterQuery } from '@dealflow360/contracts';
import { categoryRepository } from './categoryRepository.js';

export class ProductRepository {
  async findBySku(sku: string): Promise<Product | null> {
    return db.product.findUnique({
      where: { sku },
    });
  }

  async findByIdWithDetails(id: string) {
    return db.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: { category: true },
        },
        variants: {
          include: {
            attributes: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async createProduct(data: CreateProductRequest) {
    await categoryRepository.ensureDefaultCategories();

    // Find primary category
    let primaryCat = await categoryRepository.findByCode(data.category);
    if (!primaryCat) {
      primaryCat = await categoryRepository.create({
        name: data.category.replace('_', ' '),
        code: data.category,
      });
    }

    const categoryJoins = [
      { categoryId: primaryCat.id, isPrimary: true },
    ];

    if (data.additionalCategoryIds && data.additionalCategoryIds.length > 0) {
      for (const catId of data.additionalCategoryIds) {
        if (catId !== primaryCat.id) {
          categoryJoins.push({ categoryId: catId, isPrimary: false });
        }
      }
    }

    return db.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || null,
        category: data.category,
        unit: data.unit || 'Unit',
        taxRate: data.taxRate ?? 0,
        listPrice: data.unitPrice,
        standardCost: data.costPrice,
        maxAllowedDiscount: data.maxAllowedDiscount,
        billingType: data.type as BillingType,
        isActive: data.isActive ?? true,
        categories: {
          create: categoryJoins,
        },
        variants: data.variants && data.variants.length > 0
          ? {
              create: data.variants.map((v) => ({
                sku: v.sku,
                name: v.name,
                extraPrice: v.extraPrice ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        categories: {
          include: { category: true },
        },
        variants: {
          include: {
            attributes: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findMany(query: ProductFilterQuery) {
    const { search, category, categoryIds, type, isActive, page, limit } = query;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (category) {
      whereClause.category = category;
    }

    if (categoryIds) {
      const ids = categoryIds.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        whereClause.categories = {
          some: {
            categoryId: { in: ids },
          },
        };
      }
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
        include: {
          categories: {
            include: { category: true },
          },
          variants: {
            include: {
              attributes: {
                include: {
                  attributeValue: {
                    include: { attribute: true },
                  },
                },
              },
            },
          },
        },
      }),
      db.product.count({ where: whereClause }),
    ]);

    return { items, total };
  }

  async updateProduct(id: string, data: UpdateProductRequest) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.type !== undefined) updateData.billingType = data.type;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
    if (data.unitPrice !== undefined) updateData.listPrice = data.unitPrice;
    if (data.costPrice !== undefined) updateData.standardCost = data.costPrice;
    if (data.maxAllowedDiscount !== undefined) updateData.maxAllowedDiscount = data.maxAllowedDiscount;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return db.product.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          include: { category: true },
        },
        variants: {
          include: {
            attributes: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async createVariant(productId: string, data: {
    sku: string;
    name: string;
    extraPrice?: number;
    isActive?: boolean;
    attributeValueIds?: string[];
  }) {
    return db.productVariant.create({
      data: {
        productId,
        sku: data.sku,
        name: data.name,
        extraPrice: data.extraPrice ?? 0,
        isActive: data.isActive ?? true,
        attributes: data.attributeValueIds && data.attributeValueIds.length > 0
          ? {
              create: data.attributeValueIds.map((id) => ({ attributeValueId: id })),
            }
          : undefined,
      },
      include: {
        attributes: {
          include: {
            attributeValue: {
              include: { attribute: true },
            },
          },
        },
      },
    });
  }

  async updateVariant(variantId: string, data: {
    sku?: string;
    name?: string;
    extraPrice?: number;
    isActive?: boolean;
    attributeValueIds?: string[];
  }) {
    if (data.attributeValueIds !== undefined) {
      await db.variantAttributeValue.deleteMany({
        where: { variantId },
      });
      if (data.attributeValueIds.length > 0) {
        await db.variantAttributeValue.createMany({
          data: data.attributeValueIds.map((id) => ({
            variantId,
            attributeValueId: id,
          })),
        });
      }
    }

    return db.productVariant.update({
      where: { id: variantId },
      data: {
        sku: data.sku,
        name: data.name,
        extraPrice: data.extraPrice,
        isActive: data.isActive,
      },
      include: {
        attributes: {
          include: {
            attributeValue: {
              include: { attribute: true },
            },
          },
        },
      },
    });
  }

  async deleteVariant(variantId: string) {
    return db.productVariant.delete({
      where: { id: variantId },
    });
  }
}

export const productRepository = new ProductRepository();
