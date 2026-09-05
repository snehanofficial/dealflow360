import { describe, it, expect } from 'vitest';
import {
  calculateInvoiceSnapshot,
  generateInvoiceNumber,
  isInvoiceStatusTransitionValid,
  InvoiceLineCalculationInput,
} from '../invoice/invoiceEngine.js';

describe('Invoice Engine Domain Tests', () => {
  it('calculates exact acceptance formula (₹1,500 selling price, 2 qty, 10% disc, 18% tax)', () => {
    const lines: InvoiceLineCalculationInput[] = [
      {
        productId: 'prod-laptop-01',
        productName: 'Laptop Pro',
        productSku: 'SKU-LAPTOP-01',
        quantity: 2,
        listPrice: 1000, // Catalog price
        unitPrice: 1500, // Approved selling price
        proposedDiscountPercent: 10,
        taxRate: 18,
      },
    ];

    const snapshot = calculateInvoiceSnapshot(lines);

    expect(snapshot.subtotal).toBe(3000); // 1500 * 2
    expect(snapshot.taxableAmount).toBe(3000); // 3000 gross
    expect(snapshot.taxAmount).toBe(540); // 3000 * 18%
    expect(snapshot.totalDiscount).toBe(354); // (3000 + 540) * 10%
    expect(snapshot.totalAmount).toBe(3186); // (3000 + 540) - 354

    expect(snapshot.lines).toHaveLength(1);
    const line = snapshot.lines[0];
    expect(line.unitPrice).toBe(1500); // Must preserve ₹1,500 selling price, not catalog ₹1,000
    expect(line.listPrice).toBe(1000);
    expect(line.taxableAmount).toBe(3000);
    expect(line.taxAmount).toBe(540);
    expect(line.discountAmount).toBe(354);
    expect(line.lineTotal).toBe(3186);
  });

  it('preserves approved selling price even if catalog price is completely different', () => {
    const lines: InvoiceLineCalculationInput[] = [
      {
        productId: 'prod-server-01',
        productName: 'Enterprise Server',
        productSku: 'SKU-SRV-01',
        quantity: 1,
        listPrice: 1800, // Updated catalog price
        unitPrice: 1500, // Historical approved selling price
        proposedDiscountPercent: 0,
        taxRate: 10,
      },
    ];

    const snapshot = calculateInvoiceSnapshot(lines);
    expect(snapshot.lines[0].unitPrice).toBe(1500);
    expect(snapshot.subtotal).toBe(1500);
    expect(snapshot.totalAmount).toBe(1650); // 1500 + 150 tax
  });

  it('generates formatted invoice numbers correctly', () => {
    const fixedDate = new Date('2026-09-06T00:00:00Z');
    const invNum = generateInvoiceNumber(123, fixedDate);
    expect(invNum).toBe('INV-2026-000123');
  });

  it('validates state transitions accurately', () => {
    expect(isInvoiceStatusTransitionValid('DRAFT', 'ISSUED')).toBe(true);
    expect(isInvoiceStatusTransitionValid('DRAFT', 'VOID')).toBe(true);
    expect(isInvoiceStatusTransitionValid('ISSUED', 'PAID')).toBe(true);
    expect(isInvoiceStatusTransitionValid('ISSUED', 'VOID')).toBe(true);
    expect(isInvoiceStatusTransitionValid('PAID', 'ISSUED')).toBe(false);
    expect(isInvoiceStatusTransitionValid('PAID', 'DRAFT')).toBe(false);
    expect(isInvoiceStatusTransitionValid('VOID', 'ISSUED')).toBe(false);
  });
});
