export const roundMoney = (val: number): number =>
  Math.round((val + Number.EPSILON) * 100) / 100;

export interface LineMarginInput {
  quantity: number;
  effectiveUnitPrice: number;
  proposedDiscountPercent: number;
  unitCost: number;
}

export interface LineMarginOutput {
  lineSubtotal: number;
  discountAmount: number;
  netLineTotal: number;
  netUnitPrice: number;
  totalCost: number;
  marginAmount: number;
  marginPercentage: number;
}

export function calculateLineMargin(input: LineMarginInput): LineMarginOutput {
  const { quantity, effectiveUnitPrice, proposedDiscountPercent, unitCost } = input;
  const validQty = Math.max(1, Math.floor(quantity));
  const validPrice = Math.max(0, effectiveUnitPrice);
  const validDiscountPct = Math.min(100, Math.max(0, proposedDiscountPercent));
  const validCost = Math.max(0, unitCost);

  const lineSubtotal = roundMoney(validQty * validPrice);
  const discountAmount = roundMoney(lineSubtotal * (validDiscountPct / 100));
  const netLineTotal = roundMoney(lineSubtotal - discountAmount);
  const netUnitPrice = validQty > 0 ? roundMoney(netLineTotal / validQty) : 0;
  const totalCost = roundMoney(validQty * validCost);
  const marginAmount = roundMoney(netLineTotal - totalCost);

  let marginPercentage = 0;
  if (netLineTotal > 0) {
    marginPercentage = roundMoney((marginAmount / netLineTotal) * 100);
  } else if (totalCost > 0) {
    marginPercentage = -100;
  }

  return {
    lineSubtotal,
    discountAmount,
    netLineTotal,
    netUnitPrice,
    totalCost,
    marginAmount,
    marginPercentage,
  };
}

export interface DealTotalsOutput {
  subtotal: number;
  totalDiscount: number;
  netTotal: number;
  totalCost: number;
  marginAmount: number;
  marginPercentage: number;
}

export function calculateDealTotals(
  lines: Array<{
    lineSubtotal: number;
    discountAmount: number;
    netLineTotal: number;
    totalCost: number;
    marginAmount: number;
  }>,
): DealTotalsOutput {
  let subtotal = 0;
  let totalDiscount = 0;
  let netTotal = 0;
  let totalCost = 0;
  let marginAmount = 0;

  for (const line of lines) {
    subtotal += line.lineSubtotal;
    totalDiscount += line.discountAmount;
    netTotal += line.netLineTotal;
    totalCost += line.totalCost;
    marginAmount += line.marginAmount;
  }

  subtotal = roundMoney(subtotal);
  totalDiscount = roundMoney(totalDiscount);
  netTotal = roundMoney(netTotal);
  totalCost = roundMoney(totalCost);
  marginAmount = roundMoney(marginAmount);

  let marginPercentage = 0;
  if (netTotal > 0) {
    marginPercentage = roundMoney((marginAmount / netTotal) * 100);
  } else if (totalCost > 0) {
    marginPercentage = -100;
  }

  return {
    subtotal,
    totalDiscount,
    netTotal,
    totalCost,
    marginAmount,
    marginPercentage,
  };
}
