import { roundMoney } from '../margin/marginEngine.js';

export interface InvoiceLineCalculationInput {
  productId?: string | null;
  productName: string;
  productSku: string;
  quantity: number;
  listPrice: number;
  unitPrice: number; // Approved selling price
  proposedDiscountPercent: number;
  taxRate: number;
}

export interface InvoiceLineSnapshot {
  productId?: string | null;
  productName: string;
  productSku: string;
  quantity: number;
  listPrice: number;
  unitPrice: number;
  proposedDiscountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface InvoiceHeaderSnapshot {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  lines: InvoiceLineSnapshot[];
}

/**
 * Computes authoritative invoice financial snapshot directly from approved quotation commercial terms.
 * Guarantees that unitPrice is the approved selling price (not catalog price), and that totals reconcile cleanly.
 */
export function calculateInvoiceSnapshot(
  lineInputs: InvoiceLineCalculationInput[],
): InvoiceHeaderSnapshot {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let taxAmount = 0;
  let totalAmount = 0;

  const lines: InvoiceLineSnapshot[] = lineInputs.map((line) => {
    const qty = Math.max(1, line.quantity);
    const unitPrice = roundMoney(Math.max(0, line.unitPrice));
    const grossLine = roundMoney(unitPrice * qty);
    const lineTaxable = roundMoney(grossLine);
    const taxRate = Math.min(100, Math.max(0, line.taxRate));
    const lineTax = roundMoney(lineTaxable * (taxRate / 100));
    const grossWithTax = roundMoney(grossLine + lineTax);
    const discPct = Math.min(100, Math.max(0, line.proposedDiscountPercent));
    const discountAmount = roundMoney(grossWithTax * (discPct / 100));
    const lineTotal = roundMoney(grossWithTax - discountAmount);

    subtotal += grossLine;
    totalDiscount += discountAmount;
    taxableAmount += lineTaxable;
    taxAmount += lineTax;
    totalAmount += lineTotal;

    return {
      productId: line.productId || null,
      productName: line.productName,
      productSku: line.productSku,
      quantity: qty,
      listPrice: roundMoney(line.listPrice),
      unitPrice,
      proposedDiscountPercent: discPct,
      discountAmount,
      taxableAmount: lineTaxable,
      taxRate,
      taxAmount: lineTax,
      lineTotal,
    };
  });

  return {
    subtotal: roundMoney(subtotal),
    totalDiscount: roundMoney(totalDiscount),
    taxableAmount: roundMoney(taxableAmount),
    taxAmount: roundMoney(taxAmount),
    totalAmount: roundMoney(totalAmount),
    lines,
  };
}

/**
 * Formats standard invoice numbers, e.g., INV-2026-000101
 */
export function generateInvoiceNumber(sequence: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const seqStr = String(sequence).padStart(6, '0');
  return `INV-${year}-${seqStr}`;
}

/**
 * Validates invoice status state transitions.
 */
export function isInvoiceStatusTransitionValid(
  currentStatus: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID',
  targetStatus: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID',
): boolean {
  if (currentStatus === targetStatus) return true;

  switch (currentStatus) {
    case 'DRAFT':
      return targetStatus === 'ISSUED' || targetStatus === 'VOID';
    case 'ISSUED':
      return targetStatus === 'PAID' || targetStatus === 'VOID';
    case 'PAID':
    case 'VOID':
      return false; // Terminal states
    default:
      return false;
  }
}
