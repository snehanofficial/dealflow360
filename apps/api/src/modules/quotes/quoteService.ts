import { db, Quotation, QuoteLine, Product, Customer } from '@dealflow360/db';

export type QuotationWithDetails = Quotation & {
  customer: Customer;
  lines: (QuoteLine & { product: Product })[];
};

export class QuoteService {
  async getQuotationById(quotationId: string): Promise<QuotationWithDetails | null> {
    return db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async addQuoteLine(
    quotationId: string,
    input: {
      productId: string;
      quantity?: number;
      proposedDiscountPercent?: number;
    },
  ): Promise<QuotationWithDetails> {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { lines: true },
    });

    if (!quotation) {
      throw new Error(`Quotation with ID ${quotationId} not found`);
    }

    const product = await db.product.findUnique({
      where: { id: input.productId },
    });

    if (!product || !product.isActive) {
      throw new Error(`Product ${input.productId} is not available`);
    }

    const qty = Math.max(input.quantity || 1, 1);
    const discountPct = Math.min(Math.max(input.proposedDiscountPercent || 0, 0), 100);

    const existingLine = quotation.lines.find((l) => l.productId === input.productId);

    if (existingLine) {
      const newQty = existingLine.quantity + qty;
      const listPriceTotal = product.listPrice * newQty;
      const discountAmount = Math.round(listPriceTotal * (discountPct / 100) * 100) / 100;
      const netLinePrice = Math.round((listPriceTotal - discountAmount) * 100) / 100;
      const lineCost = Math.round(product.standardCost * newQty * 100) / 100;
      const lineMarginPercent =
        netLinePrice > 0
          ? Math.round(((netLinePrice - lineCost) / netLinePrice) * 10000) / 100
          : 0;

      await db.quoteLine.update({
        where: { id: existingLine.id },
        data: {
          quantity: newQty,
          proposedDiscountPercent: discountPct,
          discountAmount,
          netLinePrice,
          lineCost,
          lineMarginPercent,
        },
      });
    } else {
      const listPriceTotal = product.listPrice * qty;
      const discountAmount = Math.round(listPriceTotal * (discountPct / 100) * 100) / 100;
      const netLinePrice = Math.round((listPriceTotal - discountAmount) * 100) / 100;
      const lineCost = Math.round(product.standardCost * qty * 100) / 100;
      const lineMarginPercent =
        netLinePrice > 0
          ? Math.round(((netLinePrice - lineCost) / netLinePrice) * 10000) / 100
          : 0;

      await db.quoteLine.create({
        data: {
          quotationId,
          productId: product.id,
          quantity: qty,
          listPrice: product.listPrice,
          proposedDiscountPercent: discountPct,
          discountAmount,
          netLinePrice,
          lineCost,
          lineMarginPercent,
        },
      });
    }

    // Recalculate quotation totals and margin
    await this.recalculateQuotation(quotationId);

    const updated = await this.getQuotationById(quotationId);
    if (!updated) {
      throw new Error(`Failed to retrieve updated quotation ${quotationId}`);
    }

    return updated;
  }

  async recalculateQuotation(quotationId: string): Promise<void> {
    const updatedLines = await db.quoteLine.findMany({
      where: { quotationId },
    });

    let subtotal = 0;
    let totalDiscount = 0;
    let netValue = 0;
    let totalCost = 0;

    for (const line of updatedLines) {
      subtotal += line.listPrice * line.quantity;
      totalDiscount += line.discountAmount;
      netValue += line.netLinePrice;
      totalCost += line.lineCost;
    }

    subtotal = Math.round(subtotal * 100) / 100;
    totalDiscount = Math.round(totalDiscount * 100) / 100;
    netValue = Math.round(netValue * 100) / 100;
    totalCost = Math.round(totalCost * 100) / 100;

    let grossMarginPercent = 0;
    if (netValue > 0) {
      grossMarginPercent = Math.round(((netValue - totalCost) / netValue) * 10000) / 100;
    }

    // Deterministic commercial risk evaluation:
    // Avg discount % and margin % affect risk score
    const avgDiscountPct = subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0;
    let riskScore = 1.0;
    if (avgDiscountPct > 20) riskScore += 4.0;
    else if (avgDiscountPct > 10) riskScore += 2.0;

    if (grossMarginPercent < 20) riskScore += 5.0;
    else if (grossMarginPercent < 30) riskScore += 2.5;

    let riskLevel = 'LOW';
    if (riskScore >= 7.0) riskLevel = 'HIGH';
    else if (riskScore >= 4.0) riskLevel = 'MEDIUM';

    await db.quotation.update({
      where: { id: quotationId },
      data: {
        subtotal,
        totalDiscount,
        netValue,
        grossMarginPercent,
        riskScore: Math.round(riskScore * 10) / 10,
        riskLevel,
      },
    });
  }
}

export const quoteService = new QuoteService();
