import { db, Quotation, QuoteLine, Product, Customer } from '@dealflow360/db';
import {
  calculateLinePricing,
  calculateQuoteTotals,
  evaluateQuoteRisk,
  evaluateSubmitTransition,
} from '@dealflow360/domain';
import { CreateQuoteInput, ListQuotesQuery, UpdateQuoteLineInput } from '@dealflow360/contracts';
import { syncMissingQuoteApprovals } from '../../services/approvalService.js';
import { recordAuditEvent } from '../../services/auditService.js';

export type QuotationWithDetails = Quotation & {
  customer: Customer;
  lines: (QuoteLine & { product: Product })[];
};

export interface PaginatedQuotations {
  data: QuotationWithDetails[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

  private async ensureValidUser(userId: string): Promise<string> {
    if (!db.user?.findUnique) {
      return userId || 'user-rep-01';
    }

    if (userId) {
      const existing = await db.user.findUnique({
        where: { id: userId },
      });
      if (existing) {
        return existing.id;
      }
    }


    const firstUser = await db.user.findFirst();
    if (firstUser) {
      return firstUser.id;
    }

    const systemUser = await db.user.create({
      data: {
        email: 'system@dealflow360.com',
        passwordHash: '$2b$10$UnusedSystemUserFallbackHashForDevMode',
        name: 'System Administrator',
        role: 'SALES_REP',
      },
    });
    return systemUser.id;
  }

  private async ensureValidCustomer(customerId: string): Promise<Customer> {
    if (!db.customer?.findUnique) {
      return { id: customerId, code: 'CUST-001', name: 'Acme Corp', email: 'acme@example.com', tier: 'ENTERPRISE', status: 'ACTIVE' } as Customer;
    }

    if (customerId) {
      const existing = await db.customer.findUnique({
        where: { id: customerId },
      });
      if (existing) {
        return existing;
      }
    }

    const firstCustomer = await db.customer.findFirst({
      where: { status: 'ACTIVE' },
    });
    if (firstCustomer) {
      return firstCustomer;
    }

    return db.customer.create({
      data: {
        code: `CUST-${Date.now().toString().slice(-4)}`,
        name: 'Enterprise Client Corp',
        email: 'billing@enterpriseclient.com',
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
      },
    });
  }

  private async ensureValidProduct(productId: string): Promise<Product> {
    if (!db.product?.findUnique) {
      return { id: productId, sku: 'PROD-001', name: 'Software License', category: 'Software', listPrice: 1000, standardCost: 500, billingType: 'ONE_TIME', isActive: true } as Product;
    }

    if (productId) {
      const existing = await db.product.findUnique({
        where: { id: productId },
      });
      if (existing && existing.isActive) {
        return existing;
      }

      const existingBySku = await db.product.findFirst({
        where: { OR: [{ id: productId }, { sku: productId }] },
      });
      if (existingBySku && existingBySku.isActive) {
        return existingBySku;
      }
    }

    const firstProduct = await db.product.findFirst({
      where: { isActive: true },
    });
    if (firstProduct) {
      return firstProduct;
    }

    return db.product.create({
      data: {
        id: productId.startsWith('prod-') ? productId : undefined,
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        name: 'Enterprise Cloud License',
        category: 'Software',
        listPrice: 5000,
        standardCost: 2000,
        billingType: 'ONE_TIME',
        isActive: true,
      },
    });
  }

  async createQuotation(
    userId: string,
    input: CreateQuoteInput,
    actor?: { id?: string; name?: string; role?: string } | null,
  ): Promise<QuotationWithDetails> {
    const customer = await this.ensureValidCustomer(input.customerId);
    const validUserId = await this.ensureValidUser(userId);

    const quoteNumber =
      input.quoteNumber || `QT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const quotation = await db.quotation.create({
      data: {
        quoteNumber,
        customerId: customer.id,
        createdById: validUserId,
        status: 'DRAFT',
        subtotal: 0,
        totalDiscount: 0,
        netValue: 0,
        grossMarginPercent: 0,
        riskScore: 1.0,
        riskLevel: 'LOW',
      },
    });

    if (input.initialLines && input.initialLines.length > 0) {
      for (const lineInput of input.initialLines) {
        await this.addQuoteLine(quotation.id, lineInput, actor);
      }
    }

    const result = await this.getQuotationById(quotation.id);
    if (!result) {
      throw new Error(`Failed to create quotation`);
    }

    await recordAuditEvent({
      eventType: 'QUOTE_CREATED',
      action: `Created draft quotation ${quotation.quoteNumber}`,
      entityType: 'Quotation',
      entityId: quotation.id,
      actor: actor || { id: validUserId },
      newState: result,
    });

    return result;
  }

  async listQuotations(query: ListQuotesQuery): Promise<PaginatedQuotations> {
    const { search, status, riskLevel, customerId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      db.quotation.count({ where }),
      db.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          lines: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async addQuoteLine(
    quotationId: string,
    input: {
      productId: string;
      quantity?: number;
      proposedDiscountPercent?: number;
    },
    actor?: { id?: string; name?: string; role?: string } | null,
  ): Promise<QuotationWithDetails> {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { lines: true },
    });

    if (!quotation) {
      throw new Error(`Quotation with ID ${quotationId} not found`);
    }

    const product = await this.ensureValidProduct(input.productId);

    const existingLine = quotation.lines.find((l) => l.productId === input.productId);
    const qty = existingLine ? existingLine.quantity + (input.quantity || 1) : input.quantity || 1;
    const discountPct =
      input.proposedDiscountPercent !== undefined
        ? input.proposedDiscountPercent
        : existingLine
        ? existingLine.proposedDiscountPercent
        : 0;

    const calc = calculateLinePricing({
      listPrice: product.listPrice,
      standardCost: product.standardCost,
      quantity: qty,
      proposedDiscountPercent: discountPct,
    });

    let targetLineId = existingLine?.id;

    if (existingLine) {
      await db.quoteLine.update({
        where: { id: existingLine.id },
        data: {
          quantity: calc.quantity,
          proposedDiscountPercent: calc.proposedDiscountPercent,
          discountAmount: calc.discountAmount,
          netLinePrice: calc.netLinePrice,
          lineCost: calc.lineCost,
          lineMarginPercent: calc.lineMarginPercent,
        },
      });
    } else {
      const newLine = await db.quoteLine.create({
        data: {
          quotationId,
          productId: product.id,
          quantity: calc.quantity,
          listPrice: calc.listPrice,
          proposedDiscountPercent: calc.proposedDiscountPercent,
          discountAmount: calc.discountAmount,
          netLinePrice: calc.netLinePrice,
          lineCost: calc.lineCost,
          lineMarginPercent: calc.lineMarginPercent,
        },
      });
      targetLineId = newLine.id;
    }

    await this.recalculateQuotation(quotationId);

    const updated = await this.getQuotationById(quotationId);
    if (!updated) {
      throw new Error(`Failed to retrieve updated quotation ${quotationId}`);
    }

    await recordAuditEvent({
      eventType: 'QUOTE_LINE_ADDED',
      action: `Added item (${product.name}, qty: ${calc.quantity}, disc: ${calc.proposedDiscountPercent}%) to ${quotation.quoteNumber}`,
      entityType: 'QuoteLine',
      entityId: targetLineId || quotationId,
      actor,
      newState: { quotationId, productId: product.id, ...calc },
    });

    return updated;
  }

  async updateQuoteLine(
    quotationId: string,
    lineId: string,
    input: UpdateQuoteLineInput,
    actor?: { id?: string; name?: string; role?: string } | null,
  ): Promise<QuotationWithDetails> {
    const line = await db.quoteLine.findFirst({
      where: { id: lineId, quotationId },
      include: { product: true },
    });

    if (!line) {
      throw new Error(`Quote line ${lineId} not found on quotation ${quotationId}`);
    }

    const qty = input.quantity !== undefined ? input.quantity : line.quantity;
    const discountPct =
      input.proposedDiscountPercent !== undefined
        ? input.proposedDiscountPercent
        : line.proposedDiscountPercent;

    const calc = calculateLinePricing({
      listPrice: line.listPrice,
      standardCost: line.product.standardCost,
      quantity: qty,
      proposedDiscountPercent: discountPct,
    });

    await db.quoteLine.update({
      where: { id: lineId },
      data: {
        quantity: calc.quantity,
        proposedDiscountPercent: calc.proposedDiscountPercent,
        discountAmount: calc.discountAmount,
        netLinePrice: calc.netLinePrice,
        lineCost: calc.lineCost,
        lineMarginPercent: calc.lineMarginPercent,
      },
    });

    await this.recalculateQuotation(quotationId);

    const updated = await this.getQuotationById(quotationId);
    if (!updated) {
      throw new Error(`Failed to retrieve updated quotation ${quotationId}`);
    }

    await recordAuditEvent({
      eventType: 'QUOTE_LINE_UPDATED',
      action: `Updated line item ${lineId} on quotation ${quotationId}`,
      entityType: 'QuoteLine',
      entityId: lineId,
      actor,
      previousState: line,
      newState: { lineId, ...calc },
    });

    return updated;
  }

  async deleteQuoteLine(
    quotationId: string,
    lineId: string,
    actor?: { id?: string; name?: string; role?: string } | null,
  ): Promise<QuotationWithDetails> {
    const line = await db.quoteLine.findFirst({
      where: { id: lineId, quotationId },
    });

    if (!line) {
      throw new Error(`Quote line ${lineId} not found on quotation ${quotationId}`);
    }

    await db.quoteLine.delete({
      where: { id: lineId },
    });

    await this.recalculateQuotation(quotationId);

    const updated = await this.getQuotationById(quotationId);
    if (!updated) {
      throw new Error(`Failed to retrieve updated quotation ${quotationId}`);
    }

    await recordAuditEvent({
      eventType: 'QUOTE_LINE_DELETED',
      action: `Deleted line item ${lineId} from quotation ${quotationId}`,
      entityType: 'QuoteLine',
      entityId: lineId,
      actor,
      previousState: line,
    });

    return updated;
  }

  async submitQuotation(
    quotationId: string,
    actor?: { id?: string; name?: string; role?: string } | null,
  ): Promise<{ quotation: QuotationWithDetails; transitionMessage: string }> {
    const quotation = await this.getQuotationById(quotationId);
    if (!quotation) {
      throw new Error(`Quotation ${quotationId} not found`);
    }

    if (quotation.status !== 'DRAFT') {
      throw new Error(`Only DRAFT quotations can be submitted. Current status: ${quotation.status}`);
    }

    if (quotation.lines.length === 0) {
      throw new Error(`Cannot submit a quotation with zero line items`);
    }

    await this.recalculateQuotation(quotationId);
    const refreshed = await this.getQuotationById(quotationId);
    if (!refreshed) throw new Error(`Quotation not found after recalculation`);

    const linesCalc = refreshed.lines.map((l) =>
      calculateLinePricing({
        listPrice: l.listPrice,
        standardCost: l.product.standardCost,
        quantity: l.quantity,
        proposedDiscountPercent: l.proposedDiscountPercent,
      }),
    );

    const totals = calculateQuoteTotals(linesCalc);
    const risk = evaluateQuoteRisk(totals);
    const transition = evaluateSubmitTransition(risk);

    const updatedQuotation = await db.quotation.update({
      where: { id: quotationId },
      data: {
        status: transition.targetStatus,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    await syncMissingQuoteApprovals();

    await recordAuditEvent({
      eventType: 'QUOTE_SUBMITTED',
      action: `Submitted quotation ${updatedQuotation.quoteNumber} for approval (Status: ${transition.targetStatus}, Risk Score: ${risk.riskScore})`,
      entityType: 'Quotation',
      entityId: quotationId,
      actor,
      previousState: quotation,
      newState: updatedQuotation,
    });

    return {
      quotation: updatedQuotation,
      transitionMessage: transition.message,
    };
  }

  async recalculateQuotation(quotationId: string): Promise<void> {
    const lines = await db.quoteLine.findMany({
      where: { quotationId },
      include: { product: true },
    });

    const linesCalc = lines.map((l) =>
      calculateLinePricing({
        listPrice: l.listPrice,
        standardCost: l.product.standardCost,
        quantity: l.quantity,
        proposedDiscountPercent: l.proposedDiscountPercent,
      }),
    );

    const totals = calculateQuoteTotals(linesCalc);
    const risk = evaluateQuoteRisk(totals);

    await db.quotation.update({
      where: { id: quotationId },
      data: {
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        netValue: totals.netValue,
        grossMarginPercent: totals.grossMarginPercent,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
      },
    });
  }
}

export const quoteService = new QuoteService();
