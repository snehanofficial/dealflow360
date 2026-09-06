import { db, Category, DiscountPolicyRule } from '@dealflow360/db';

export interface CategoryWithStats extends Category {
  productCount: number;
  discountPolicy?: DiscountPolicyRule | null;
}

export interface CategoryDetailWithProducts extends Category {
  productCount: number;
  discountPolicies: DiscountPolicyRule[];
  products: Array<{
    id: string;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    billingType: string;
    unitPrice: number;
    standardCost: number;
    maxAllowedDiscount: number;
    isActive: boolean;
    isPrimary: boolean;
  }>;
}

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return db.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAllWithStats(): Promise<CategoryWithStats[]> {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const activeRules = await db.discountPolicyRule.findMany({
      where: { isActive: true },
    });

    const allProducts = await db.product.findMany({
      select: { id: true, category: true },
    });

    return categories.map((cat) => {
      // Products count by junction or matching category string/code
      const legacyCount = allProducts.filter(
        (p) => p.category.toUpperCase() === cat.code.toUpperCase() || p.category.toUpperCase() === cat.name.toUpperCase(),
      ).length;
      const count = Math.max(cat._count.products, legacyCount);

      // Find matching discount policy rule by category code or name
      const matchingPolicy = activeRules.find(
        (r) =>
          r.category &&
          (r.category.toUpperCase() === cat.code.toUpperCase() || r.category.toUpperCase() === cat.name.toUpperCase()),
      ) || null;

      return {
        ...cat,
        productCount: count,
        discountPolicy: matchingPolicy,
      };
    });
  }

  async findById(id: string): Promise<Category | null> {
    return db.category.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
    });
  }

  async findByIdWithDetails(idOrCode: string): Promise<CategoryDetailWithProducts | null> {
    const category = await db.category.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!category) return null;

    // Fetch legacy or direct products matching category string
    const legacyProducts = await db.product.findMany({
      where: {
        OR: [
          { category: { equals: category.code, mode: 'insensitive' } },
          { category: { equals: category.name, mode: 'insensitive' } },
        ],
      },
    });

    // Combine products from junction and legacy string category
    const productMap = new Map<string, any>();

    for (const rel of category.products) {
      productMap.set(rel.product.id, {
        id: rel.product.id,
        sku: rel.product.sku,
        name: rel.product.name,
        description: rel.product.description,
        category: rel.product.category,
        billingType: rel.product.billingType,
        unitPrice: rel.product.listPrice,
        standardCost: rel.product.standardCost,
        maxAllowedDiscount: rel.product.maxAllowedDiscount,
        isActive: rel.product.isActive,
        isPrimary: rel.isPrimary,
      });
    }

    for (const prod of legacyProducts) {
      if (!productMap.has(prod.id)) {
        productMap.set(prod.id, {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          description: prod.description,
          category: prod.category,
          billingType: prod.billingType,
          unitPrice: prod.listPrice,
          standardCost: prod.standardCost,
          maxAllowedDiscount: prod.maxAllowedDiscount,
          isActive: prod.isActive,
          isPrimary: true,
        });
      }
    }

    const productsList = Array.from(productMap.values());

    // Fetch matching discount policies for this category
    const discountPolicies = await db.discountPolicyRule.findMany({
      where: {
        OR: [
          { category: { equals: category.code, mode: 'insensitive' } },
          { category: { equals: category.name, mode: 'insensitive' } },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    return {
      ...category,
      productCount: productsList.length,
      discountPolicies,
      products: productsList,
    };
  }

  async findByCode(code: string): Promise<Category | null> {
    return db.category.findUnique({
      where: { code },
    });
  }

  async create(data: { name: string; code: string; description?: string }): Promise<Category> {
    return db.category.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description || null,
      },
    });
  }

  async update(id: string, data: { name?: string; code?: string; description?: string }): Promise<Category> {
    return db.category.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.code ? { code: data.code.toUpperCase() } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  }

  async delete(id: string): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if any product has this as legacy category string or primary category
    const primaryProductCount = await db.product.count({
      where: {
        category: category.code,
      },
    });

    if (primaryProductCount > 0) {
      throw new Error(
        `Cannot delete category '${category.name}' because ${primaryProductCount} product(s) are assigned to it. Please reassign products first.`,
      );
    }

    return db.category.delete({
      where: { id },
    });
  }

  async upsertCategoryDiscountPolicy(
    idOrCode: string,
    data: {
      maxDiscountPercent: number;
      minMarginPercent?: number | null;
      requiredApprovalRole?: any;
      customerTier?: any;
    },
  ): Promise<DiscountPolicyRule> {
    const category = await this.findById(idOrCode);
    const categoryCode = category ? category.code : idOrCode.toUpperCase();
    const categoryName = category ? category.name : categoryCode;

    const existingRule = await db.discountPolicyRule.findFirst({
      where: {
        category: { equals: categoryCode, mode: 'insensitive' },
        customerTier: data.customerTier || null,
      },
    });

    if (existingRule) {
      return db.discountPolicyRule.update({
        where: { id: existingRule.id },
        data: {
          maxDiscountPercent: data.maxDiscountPercent,
          minMarginPercent: data.minMarginPercent !== undefined ? data.minMarginPercent : existingRule.minMarginPercent,
          requiredApprovalRole: data.requiredApprovalRole || existingRule.requiredApprovalRole,
          isActive: true,
        },
      });
    } else {
      return db.discountPolicyRule.create({
        data: {
          name: `${categoryName} Category Governance Policy`,
          description: `Category-level discount & margin limit for ${categoryName}`,
          category: categoryCode,
          customerTier: data.customerTier || null,
          maxDiscountPercent: data.maxDiscountPercent,
          minMarginPercent: data.minMarginPercent ?? null,
          requiredApprovalRole: data.requiredApprovalRole || 'SALES_MANAGER',
          priority: 20,
          isActive: true,
        },
      });
    }
  }

  async ensureDefaultCategories(): Promise<void> {
    const defaults = [
      { name: 'Hardware', code: 'HARDWARE', description: 'Physical enterprise equipment and devices' },
      { name: 'Software License', code: 'SOFTWARE_LICENSE', description: 'On-premise and digital software licenses' },
      { name: 'Subscription', code: 'SUBSCRIPTION', description: 'SaaS and cloud subscriptions' },
      { name: 'Professional Services', code: 'PROFESSIONAL_SERVICES', description: 'Implementation and custom services' },
      { name: 'Support', code: 'SUPPORT', description: 'SLA support and maintenance contracts' },
    ];

    for (const cat of defaults) {
      const existing = await db.category.findFirst({
        where: { OR: [{ code: cat.code }, { name: cat.name }] },
      });
      if (existing) {
        await db.category.update({
          where: { id: existing.id },
          data: { code: cat.code, description: cat.description },
        });
      } else {
        await db.category.create({ data: cat });
      }
    }
  }
}

export const categoryRepository = new CategoryRepository();

