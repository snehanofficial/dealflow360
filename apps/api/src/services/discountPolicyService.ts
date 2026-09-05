import {
  DiscountPolicyRuleDto,
  CreateDiscountPolicyRuleRequest,
  UpdateDiscountPolicyRuleRequest,
} from '@dealflow360/contracts';
import { discountPolicyRepository, DiscountPolicyFilterQuery } from '../repositories/discountPolicyRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import { recordAuditEvent } from './auditService.js';

export interface ServiceActor {
  id?: string | null;
  name?: string | null;
  role?: string | null;
}

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

export async function createDiscountPolicy(
  data: CreateDiscountPolicyRuleRequest,
  actor?: ServiceActor | null,
): Promise<DiscountPolicyRuleDto> {
  const created = await discountPolicyRepository.create(data);
  const dto = mapToDiscountPolicyRuleDto(created);

  await recordAuditEvent({
    eventType: 'DISCOUNT_POLICY_CREATED',
    action: `Created Discount Policy ${created.name}`,
    entityType: 'DiscountPolicyRule',
    entityId: created.id,
    actor,
    newState: created,
  });

  return dto;
}

export async function updateDiscountPolicy(
  id: string,
  data: UpdateDiscountPolicyRuleRequest,
  actor?: ServiceActor | null,
): Promise<DiscountPolicyRuleDto> {
  const existing = await discountPolicyRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }

  const updated = await discountPolicyRepository.update(id, data);
  const dto = mapToDiscountPolicyRuleDto(updated);

  await recordAuditEvent({
    eventType: 'DISCOUNT_POLICY_UPDATED',
    action: `Updated Discount Policy ${updated.name}`,
    entityType: 'DiscountPolicyRule',
    entityId: updated.id,
    actor,
    previousState: existing,
    newState: updated,
  });

  return dto;
}

export async function toggleDiscountPolicyStatus(
  id: string,
  isActive: boolean,
  actor?: ServiceActor | null,
): Promise<DiscountPolicyRuleDto> {
  const existing = await discountPolicyRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }

  const updated = await discountPolicyRepository.update(id, { isActive });
  const dto = mapToDiscountPolicyRuleDto(updated);

  await recordAuditEvent({
    eventType: 'DISCOUNT_POLICY_UPDATED',
    action: `${isActive ? 'Activated' : 'Deactivated'} Discount Policy ${updated.name}`,
    entityType: 'DiscountPolicyRule',
    entityId: updated.id,
    actor,
    previousState: existing,
    newState: updated,
  });

  return dto;
}

export async function deleteDiscountPolicy(id: string): Promise<void> {
  const existing = await discountPolicyRepository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', `Discount policy rule with ID '${id}' not found.`, 404);
  }

  await discountPolicyRepository.delete(id);
}
