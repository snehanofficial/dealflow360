export interface LineCalculationInput {
  listPrice: number;
  standardCost: number;
  quantity: number;
  proposedDiscountPercent: number;
}

export interface LineCalculationResult {
  listPrice: number;
  quantity: number;
  proposedDiscountPercent: number;
  discountAmount: number;
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
 * Calculates line level financial metrics (net price, discount amount, margin %)
 */
export function calculateLinePricing(input: LineCalculationInput): LineCalculationResult {
  const qty = Math.max(input.quantity, 1);
  const discountPct = Math.min(Math.max(input.proposedDiscountPercent, 0), 100);

  const listPriceTotal = input.listPrice * qty;
  const discountAmount = Math.round(listPriceTotal * (discountPct / 100) * 100) / 100;
  const netLinePrice = Math.round((listPriceTotal - discountAmount) * 100) / 100;
  const lineCost = Math.round(input.standardCost * qty * 100) / 100;
  const lineMarginPercent =
    netLinePrice > 0
      ? Math.round(((netLinePrice - lineCost) / netLinePrice) * 10000) / 100
      : 0;

  return {
    listPrice: input.listPrice,
    quantity: qty,
    proposedDiscountPercent: discountPct,
    discountAmount,
    netLinePrice,
    lineCost,
    lineMarginPercent,
  };
}

/**
 * Calculates quote header aggregate financials (subtotal, total discount, net value, gross margin %)
 */
export function calculateQuoteTotals(lines: LineCalculationResult[]): QuoteTotalsResult {
  let subtotal = 0;
  let totalDiscount = 0;
  let netValue = 0;
  let totalCost = 0;

  for (const line of lines) {
    subtotal += line.listPrice * line.quantity;
    totalDiscount += line.discountAmount;
    netValue += line.netLinePrice;
    totalCost += line.lineCost;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  totalDiscount = Math.round(totalDiscount * 100) / 100;
  netValue = Math.round(netValue * 100) / 100;
  totalCost = Math.round(totalCost * 100) / 100;

  const grossMarginPercent =
    netValue > 0 ? Math.round(((netValue - totalCost) / netValue) * 10000) / 100 : 0;
  const avgDiscountPercent =
    subtotal > 0 ? Math.round((totalDiscount / subtotal) * 10000) / 100 : 0;

  return {
    subtotal,
    totalDiscount,
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
