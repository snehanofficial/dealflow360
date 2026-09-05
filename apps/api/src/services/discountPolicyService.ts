import {
  DiscountPolicyRuleDto,
  CreateDiscountPolicyRuleRequest,
  UpdateDiscountPolicyRuleRequest,
} from '@dealflow360/contracts';
import { discountPolicyRepository, DiscountPolicyFilterQuery } from '../repositories/discountPolicyRepository.js';
import { AppError } from '../middleware/errorHandler.js';

function mapToDiscountPolicyRuleDto(rule: any): DiscountPolicyRuleDto {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description || null,
    customerTier: rule.customerTier || null,
    category: rule.category || null,
    productId: rule.productId || null,
    maxDiscountPercent: rule.maxDiscountPercent,
    minMarginPercent: rule.minMarginPercent ?? null,
    requiredApprovalRole: rule.requiredApprovalRole || 'SALES_MANAGER',
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

export async function getDiscountPolicies(query: DiscountPolicyFilterQuery = {}): Promise<DiscountPolicyRuleDto[]> {
  const rules = await discountPolicyRepository.findMany(query);
  return rules.map(mapToDiscountPolicyRuleDto);
}

export async function getDiscountPolicyById(id: string): Promise<DiscountPolicyRuleDto> {
  const rule = await discountPolicyRepository.findById(id);
  if (!rule) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }
  return mapToDiscountPolicyRuleDto(rule);
}

export async function createDiscountPolicy(data: CreateDiscountPolicyRuleRequest): Promise<DiscountPolicyRuleDto> {
  const created = await discountPolicyRepository.create(data);
  return mapToDiscountPolicyRuleDto(created);
}

export async function updateDiscountPolicy(
  id: string,
  data: UpdateDiscountPolicyRuleRequest,
): Promise<DiscountPolicyRuleDto> {
  const existing = await discountPolicyRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }

  const updated = await discountPolicyRepository.update(id, data);
  return mapToDiscountPolicyRuleDto(updated);
}

export async function toggleDiscountPolicyStatus(id: string, isActive: boolean): Promise<DiscountPolicyRuleDto> {
  const existing = await discountPolicyRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }

  const updated = await discountPolicyRepository.update(id, { isActive });
  return mapToDiscountPolicyRuleDto(updated);
}

export async function deleteDiscountPolicy(id: string): Promise<void> {
  const existing = await discountPolicyRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }

  await discountPolicyRepository.delete(id);
}
