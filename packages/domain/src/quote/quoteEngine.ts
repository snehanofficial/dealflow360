import { roundMoney } from '../margin/marginEngine.js';

export interface LineCalculationInput {
  listPrice: number;
  unitPrice?: number;
  standardCost: number;
  quantity: number;
  proposedDiscountPercent: number;
  taxRate?: number;
}

export interface LineCalculationResult {
  listPrice: number;
  unitPrice: number;
  quantity: number;
  grossAmount: number;
  proposedDiscountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  netLinePrice: number;
  lineCost: number;
  lineMarginPercent: number;
}

export interface QuoteTotalsInput {
  lines: LineCalculationResult[];
}

export interface QuoteTotalsResult {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  netValue: number;
  totalCost: number;
  grossMarginPercent: number;
  avgDiscountPercent: number;
}

export interface RiskEvaluationResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  violations: string[];
  requiredRoles: ('SALES_MANAGER' | 'FINANCE_OPERATIONS')[];
}

/**
 * Calculates line level financial metrics (net price, discount amount, tax amount, margin %)
 */
export function calculateLinePricing(input: LineCalculationInput): LineCalculationResult {
  const qty = Math.max(input.quantity, 1);
  const discountPct = Math.min(Math.max(input.proposedDiscountPercent, 0), 100);
  const unitPrice = input.unitPrice !== undefined ? Math.max(0, input.unitPrice) : Math.max(0, input.listPrice);
  const taxRate = input.taxRate !== undefined ? Math.min(100, Math.max(0, input.taxRate)) : 0;

  const grossAmount = roundMoney(unitPrice * qty);
  const discountAmount = roundMoney(grossAmount * (discountPct / 100));
  const taxableAmount = roundMoney(grossAmount - discountAmount);
  const taxAmount = roundMoney(taxableAmount * (taxRate / 100));
  const netLinePrice = roundMoney(taxableAmount + taxAmount);
  const lineCost = roundMoney(input.standardCost * qty);

  const marginAmount = roundMoney(taxableAmount - lineCost);
  const lineMarginPercent =
    taxableAmount > 0
      ? roundMoney((marginAmount / taxableAmount) * 100)
      : 0;

  return {
    listPrice: input.listPrice,
    unitPrice,
    quantity: qty,
    grossAmount,
    proposedDiscountPercent: discountPct,
    discountAmount,
    taxableAmount,
    taxRate,
    taxAmount,
    netLinePrice,
    lineCost,
    lineMarginPercent,
  };
}

/**
 * Calculates quote header aggregate financials (subtotal, total discount, taxable amount, tax amount, net value, gross margin %)
 */
export function calculateQuoteTotals(lines: LineCalculationResult[]): QuoteTotalsResult {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let taxAmount = 0;
  let netValue = 0;
  let totalCost = 0;

  for (const line of lines) {
    subtotal += line.grossAmount;
    totalDiscount += line.discountAmount;
    taxableAmount += line.taxableAmount;
    taxAmount += line.taxAmount;
    netValue += line.netLinePrice;
    totalCost += line.lineCost;
  }

  subtotal = roundMoney(subtotal);
  totalDiscount = roundMoney(totalDiscount);
  taxableAmount = roundMoney(taxableAmount);
  taxAmount = roundMoney(taxAmount);
  netValue = roundMoney(netValue);
  totalCost = roundMoney(totalCost);

  const marginAmount = roundMoney(taxableAmount - totalCost);
  const grossMarginPercent =
    taxableAmount > 0 ? roundMoney((marginAmount / taxableAmount) * 100) : 0;
  const avgDiscountPercent =
    subtotal > 0 ? roundMoney((totalDiscount / subtotal) * 100) : 0;

  return {
    subtotal,
    totalDiscount,
    taxableAmount,
    taxAmount,
    netValue,
    totalCost,
    grossMarginPercent,
    avgDiscountPercent,
  };
}

/**
 * Deterministically evaluates risk score, risk level, policy violations, and required approvals
 */
export function evaluateQuoteRisk(totals: QuoteTotalsResult): RiskEvaluationResult {
  let riskScore = 1.0;
  const violations: string[] = [];
  const requiredRoles: ('SALES_MANAGER' | 'FINANCE_OPERATIONS')[] = [];

  if (totals.avgDiscountPercent > 20) {
    riskScore += 4.0;
    violations.push(`Average discount (${totals.avgDiscountPercent}%) exceeds 20% limit`);
    requiredRoles.push('SALES_MANAGER');
  } else if (totals.avgDiscountPercent > 10) {
    riskScore += 2.0;
    violations.push(`Average discount (${totals.avgDiscountPercent}%) exceeds 10% threshold`);
    requiredRoles.push('SALES_MANAGER');
  }

  if (totals.grossMarginPercent < 20) {
    riskScore += 5.0;
    violations.push(`Gross margin (${totals.grossMarginPercent}%) is below 20% minimum threshold`);
    if (!requiredRoles.includes('FINANCE_OPERATIONS')) {
      requiredRoles.push('FINANCE_OPERATIONS');
    }
  } else if (totals.grossMarginPercent < 30) {
    riskScore += 2.5;
    violations.push(`Gross margin (${totals.grossMarginPercent}%) is below 30% warning threshold`);
    if (!requiredRoles.includes('SALES_MANAGER')) {
      requiredRoles.push('SALES_MANAGER');
    }
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (riskScore >= 7.0) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 4.0) {
    riskLevel = 'MEDIUM';
  }

  return {
    riskScore: Math.round(riskScore * 10) / 10,
    riskLevel,
    violations,
    requiredRoles,
  };
}

/**
 * Determines target status upon quotation submission based on risk evaluation
 */
export function evaluateSubmitTransition(risk: RiskEvaluationResult): {
  targetStatus: 'APPROVED' | 'PENDING_MANAGER' | 'PENDING_FINANCE';
  message: string;
} {
  if (risk.requiredRoles.includes('FINANCE_OPERATIONS')) {
    return {
      targetStatus: 'PENDING_FINANCE',
      message: 'Quotation requires Finance approval due to gross margin risk',
    };
  }

  if (risk.requiredRoles.includes('SALES_MANAGER')) {
    return {
      targetStatus: 'PENDING_MANAGER',
      message: 'Quotation requires Sales Manager approval due to discount thresholds',
    };
  }

  return {
    targetStatus: 'APPROVED',
    message: 'Quotation automatically approved based on low commercial risk',
  };
}
