import {
  EvaluateCommercialScenarioRequest,
  CommercialEvaluationDto,
  DiscountPolicyRuleDto,
} from '@dealflow360/contracts';
import { db, CustomerTier } from '@dealflow360/db';
import { evaluateCommercialDeal, ProductPolicyInput, LineItemInput } from '@dealflow360/domain';
import { productRepository } from '../repositories/productRepository.js';
import { priceListRepository } from '../repositories/priceListRepository.js';
import { discountPolicyRepository } from '../repositories/discountPolicyRepository.js';
import { AppError } from '../middleware/errorHandler.js';

function mapRuleToDto(rule: any): DiscountPolicyRuleDto {
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

export async function evaluateCommercialScenario(
  payload: EvaluateCommercialScenarioRequest,
): Promise<CommercialEvaluationDto> {
  let resolvedTier: string | null = payload.customerTier || null;

  // Resolve Customer Tier from Customer record if customerId passed
  if (payload.customerId) {
    const customer = await db.customer.findUnique({
      where: { id: payload.customerId },
    });
    if (!customer) {
      throw new AppError('NOT_FOUND', `Customer with ID '${payload.customerId}' not found.`, 404);
    }
    resolvedTier = customer.tier;
  }

  const currency = payload.currency || 'USD';

  // Build domain LineItemInputs
  const lineInputs: LineItemInput[] = await Promise.all(
    payload.lines.map(async (line) => {
      const product = await productRepository.findByIdWithDetails(line.productId);
      if (!product) {
        throw new AppError('NOT_FOUND', `Product with ID '${line.productId}' not found.`, 404);
      }

      // Effective Price List resolution using A2 authority
      let effectiveUnitPrice = product.listPrice;

      if (line.unitPriceOverride !== undefined) {
        effectiveUnitPrice = line.unitPriceOverride;
      } else {
        const entryPrice = await priceListRepository.findEffectivePriceEntry(
          product.id,
          resolvedTier as CustomerTier,
          currency,
        );
        if (entryPrice !== null) {
          effectiveUnitPrice = entryPrice;
        }
      }

      // Variant extra price addition if variantId supplied
      if (line.variantId && product.variants) {
        const variant = product.variants.find((v: any) => v.id === line.variantId);
        if (variant && variant.extraPrice) {
          effectiveUnitPrice += variant.extraPrice;
        }
      }

      const productPolicyInput: ProductPolicyInput = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        maxAllowedDiscount: product.maxAllowedDiscount,
        costPrice: product.standardCost,
      };

      return {
        product: productPolicyInput,
        quantity: line.quantity,
        effectiveUnitPrice,
        proposedDiscountPercent: line.proposedDiscountPercent,
      };
    }),
  );

  // Fetch active discount policy rules from repository
  const rawRules = await discountPolicyRepository.findActiveRules();
  const activeRules: DiscountPolicyRuleDto[] = rawRules.map(mapRuleToDto);

  // Run domain evaluator
  return evaluateCommercialDeal({
    customerId: payload.customerId,
    customerTier: resolvedTier,
    currency,
    lines: lineInputs,
    activeRules,
  });
}
