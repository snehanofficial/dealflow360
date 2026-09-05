import { db, DiscountPolicyRule, CustomerTier, Role } from '@dealflow360/db';
import { CreateDiscountPolicyRuleRequest, UpdateDiscountPolicyRuleRequest } from '@dealflow360/contracts';

export interface DiscountPolicyFilterQuery {
  customerTier?: CustomerTier;
  category?: string;
  isActive?: boolean;
  search?: string;
}

export class DiscountPolicyRepository {
  async findMany(query: DiscountPolicyFilterQuery = {}): Promise<DiscountPolicyRule[]> {
    const where: any = {};

    if (query.customerTier) {
      where.customerTier = query.customerTier;
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return db.discountPolicyRule.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<DiscountPolicyRule | null> {
    return db.discountPolicyRule.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
    });
  }

  async findActiveRules(): Promise<DiscountPolicyRule[]> {
    return db.discountPolicyRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(data: CreateDiscountPolicyRuleRequest): Promise<DiscountPolicyRule> {
    return db.discountPolicyRule.create({
      data: {
        name: data.name,
        description: data.description || null,
        customerTier: (data.customerTier as CustomerTier) || null,
        category: data.category || null,
        productId: data.productId || null,
        maxDiscountPercent: data.maxDiscountPercent,
        minMarginPercent: data.minMarginPercent ?? null,
        requiredApprovalRole: (data.requiredApprovalRole as Role) || 'SALES_MANAGER',
        priority: data.priority ?? 10,
        isActive: data.isActive ?? true,
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateDiscountPolicyRuleRequest): Promise<DiscountPolicyRule> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.customerTier !== undefined) updateData.customerTier = (data.customerTier as CustomerTier) || null;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.productId !== undefined) updateData.productId = data.productId || null;
    if (data.maxDiscountPercent !== undefined) updateData.maxDiscountPercent = data.maxDiscountPercent;
    if (data.minMarginPercent !== undefined) updateData.minMarginPercent = data.minMarginPercent ?? null;
    if (data.requiredApprovalRole !== undefined) updateData.requiredApprovalRole = data.requiredApprovalRole as Role;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return db.discountPolicyRule.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await db.discountPolicyRule.delete({
      where: { id },
    });
  }
}

export const discountPolicyRepository = new DiscountPolicyRepository();
