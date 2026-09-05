import {
  DiscountPolicyRuleDto,
  PolicyViolationDto,
  LineEvaluationDetail,
  CommercialEvaluationDto,
} from '@dealflow360/contracts';
import { calculateLineMargin, calculateDealTotals, roundMoney } from '../margin/marginEngine.js';

export interface ProductPolicyInput {
  id: string;
  sku: string;
  name: string;
  category: string;
  maxAllowedDiscount: number;
  costPrice: number;
}

export interface LineItemInput {
  product: ProductPolicyInput;
  quantity: number;
  effectiveUnitPrice: number;
  proposedDiscountPercent: number;
}

export interface DealEvaluationInput {
  customerId?: string;
  customerTier?: string | null;
  currency?: string;
  lines: LineItemInput[];
  activeRules: DiscountPolicyRuleDto[];
}

export function matchApplicablePolicyRule(
  product: ProductPolicyInput,
  customerTier: string | null | undefined,
  activeRules: DiscountPolicyRuleDto[],
): DiscountPolicyRuleDto | null {
  const eligibleRules = activeRules.filter((rule) => {
    if (!rule.isActive) return false;

    // Tier match check
    if (rule.customerTier && rule.customerTier !== customerTier) {
      return false;
    }

    // Category match check
    if (rule.category && rule.category.toLowerCase() !== product.category.toLowerCase()) {
      return false;
    }

    // Specific product match check
    if (rule.productId && rule.productId !== product.id) {
      return false;
    }

    return true;
  });

  if (eligibleRules.length === 0) {
    return null;
  }

  // Calculate specificity score
  const scoredRules = eligibleRules.map((rule) => {
    let specificity = 0;
    if (rule.productId && rule.productId === product.id) specificity += 1000;
    if (rule.category && rule.category.toLowerCase() === product.category.toLowerCase()) specificity += 100;
    if (rule.customerTier && rule.customerTier === customerTier) specificity += 10;

    return {
      rule,
      specificity,
      priority: rule.priority ?? 10,
    };
  });

  // Sort by specificity descending, then priority descending
  scoredRules.sort((a, b) => {
    if (b.specificity !== a.specificity) {
      return b.specificity - a.specificity;
    }
    return b.priority - a.priority;
  });

  return scoredRules[0].rule;
}

export function evaluateLinePolicy(
  line: LineItemInput,
  customerTier: string | null | undefined,
  activeRules: DiscountPolicyRuleDto[],
): LineEvaluationDetail {
  const { product, quantity, effectiveUnitPrice, proposedDiscountPercent } = line;

  const marginOutput = calculateLineMargin({
    quantity,
    effectiveUnitPrice,
    proposedDiscountPercent,
    unitCost: product.costPrice,
  });

  const violations: PolicyViolationDto[] = [];

  // Check 1: Product level maxAllowedDiscount
  if (proposedDiscountPercent > product.maxAllowedDiscount) {
    violations.push({
      ruleName: `Product Max Discount Limit (${product.sku})`,
      violatedField: 'PRODUCT_MAX_DISCOUNT',
      allowedValue: product.maxAllowedDiscount,
      proposedValue: proposedDiscountPercent,
      severity: 'VIOLATION',
      message: `Proposed discount of ${proposedDiscountPercent}% exceeds the product max allowed discount limit of ${product.maxAllowedDiscount}%.`,
    });
  }

  // Check 2: Matching Policy Rule
  const matchedRule = matchApplicablePolicyRule(product, customerTier, activeRules);

  if (matchedRule) {
    // Check max discount
    if (proposedDiscountPercent > matchedRule.maxDiscountPercent) {
      violations.push({
        ruleId: matchedRule.id,
        ruleName: matchedRule.name,
        violatedField: 'MAX_DISCOUNT',
        allowedValue: matchedRule.maxDiscountPercent,
        proposedValue: proposedDiscountPercent,
        severity: 'VIOLATION',
        message: `Proposed discount of ${proposedDiscountPercent}% exceeds governed allowance of ${matchedRule.maxDiscountPercent}% under policy '${matchedRule.name}'.`,
      });
    }

    // Check min margin
    if (
      matchedRule.minMarginPercent !== null &&
      matchedRule.minMarginPercent !== undefined &&
      marginOutput.marginPercentage < matchedRule.minMarginPercent
    ) {
      const isCritical = marginOutput.marginPercentage < 0;
      violations.push({
        ruleId: matchedRule.id,
        ruleName: matchedRule.name,
        violatedField: 'MIN_MARGIN',
        allowedValue: matchedRule.minMarginPercent,
        proposedValue: marginOutput.marginPercentage,
        severity: isCritical ? 'CRITICAL' : 'VIOLATION',
        message: `Gross margin of ${marginOutput.marginPercentage}% is below governed minimum requirement of ${matchedRule.minMarginPercent}% under policy '${matchedRule.name}'.`,
      });
    }
  }

  return {
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    category: product.category,
    quantity,
    effectiveUnitPrice,
    lineSubtotal: marginOutput.lineSubtotal,
    proposedDiscountPercent,
    discountAmount: marginOutput.discountAmount,
    netUnitPrice: marginOutput.netUnitPrice,
    netLineTotal: marginOutput.netLineTotal,
    unitCost: product.costPrice,
    totalCost: marginOutput.totalCost,
    marginAmount: marginOutput.marginAmount,
    marginPercentage: marginOutput.marginPercentage,
    violations,
  };
}

export function evaluateCommercialDeal(input: DealEvaluationInput): CommercialEvaluationDto {
  const { customerTier, lines, activeRules } = input;

  const lineEvaluations = lines.map((line) => evaluateLinePolicy(line, customerTier, activeRules));

  const dealTotals = calculateDealTotals(lineEvaluations);

  // Aggregate all violations
  const allViolations: PolicyViolationDto[] = [];
  for (const lineEval of lineEvaluations) {
    allViolations.push(...lineEval.violations);
  }

  // Risk Score Calculation
  let riskScore = 0.0;

  // Base penalty: +2.5 per policy violation
  riskScore += allViolations.length * 2.5;

  // Total discount depth calculation
  const totalSubtotal = lineEvaluations.reduce((acc, l) => acc + l.quantity * l.effectiveUnitPrice, 0);
  const avgDiscount = totalSubtotal > 0
    ? (lineEvaluations.reduce((acc, l) => acc + l.discountAmount, 0) / totalSubtotal) * 100
    : 0;

  if (avgDiscount > 15) {
    riskScore += (avgDiscount - 15) * 0.2;
  }

  // Margin erosion penalty
  if (dealTotals.marginPercentage < 25) {
    riskScore += (25 - dealTotals.marginPercentage) * 0.15;
  }

  // Large deal size bonus risk
  if (dealTotals.netTotal > 100000) {
    riskScore += 1.0;
  }

  // Cap risk score between 0.0 and 10.0
  riskScore = roundMoney(Math.min(10.0, Math.max(0.0, riskScore)));

  // Risk level classification
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (riskScore >= 8.6) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 6.1) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 3.0) {
    riskLevel = 'MEDIUM';
  }

  // Approval Routing Derivation
  let requiresApproval = false;
  const requiredRolesSet = new Set<'SALES_MANAGER' | 'FINANCE_OPERATIONS' | 'ADMIN' | 'SALES_REP' | 'CUSTOMER'>();

  if (allViolations.length > 0 || riskScore >= 3.0 || dealTotals.netTotal > 100000) {
    requiresApproval = true;

    // Check if any violation requires FINANCE_OPERATIONS specifically
    const requiresFinance =
      allViolations.some((v) => v.violatedField === 'MIN_MARGIN' || v.severity === 'CRITICAL') ||
      riskScore >= 6.1 ||
      dealTotals.netTotal > 100000;

    // Always require Sales Manager if approval is needed
    requiredRolesSet.add('SALES_MANAGER');

    if (requiresFinance) {
      requiredRolesSet.add('FINANCE_OPERATIONS');
    }
  }

  const requiredApprovalRoles = Array.from(requiredRolesSet) as any[];

  return {
    netTotal: dealTotals.netTotal,
    marginAmount: dealTotals.marginAmount,
    marginPercentage: dealTotals.marginPercentage,
    riskScore,
    riskLevel,
    violations: allViolations,
    requiredApprovalRoles,
    requiresApproval,
    evaluatedAt: new Date().toISOString(),
    lineEvaluations,
  };
}
