import { db } from '@dealflow360/db';
import {
  calculateLinePricing,
  calculateQuoteTotals,
  evaluateQuoteRisk,
  evaluateSubmitTransition,
} from '@dealflow360/domain';
import { SubmitCounterOfferInput } from '@dealflow360/contracts';
import { AppError } from '../../middleware/errorHandler.js';
import { recordAuditEvent } from '../../services/auditService.js';

export interface SanitizedPortalQuoteLine {


  id: string;
  productId: string;
  quantity: number;
  listPrice: number;
  proposedDiscountPercent: number;
  discountAmount: number;
  netLinePrice: number;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    billingType: string;
  };
}

export interface SanitizedPortalQuote {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  totalDiscount: number;
  netValue: number;
  customer: {
    id: string;
    name: string;
    code: string;
    tier: string;
  };
  lines: SanitizedPortalQuoteLine[];
  counterOffers: {
    id: string;
    proposedDiscountPercent: number;
    customerNotes: string | null;
    status: string;
    createdAt: Date;
  }[];
}

export class PortalService {
  async generatePortalToken(
    quotationId: string,
    expiresInHours = 72,
    actor?: { id?: string; name?: string; role?: string } | null,
  ): Promise<string> {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      throw new Error(`Quotation ${quotationId} not found`);
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const portalToken = await db.portalToken.create({
      data: {
        quotationId,
        expiresAt,
        isRevoked: false,
      },
    });

    await recordAuditEvent({
      eventType: 'PORTAL_TOKEN_GENERATED',
      action: `Generated customer portal access token for quotation ${quotation.quoteNumber}`,
      entityType: 'PortalToken',
      entityId: portalToken.id,
      actor,
      newState: { quotationId, expiresAt: expiresAt.toISOString() },
    });

    return portalToken.token;
  }

  async validateAndGetPortalToken(token: string) {
    const portalTokenRecord = await db.portalToken.findUnique({
      where: { token },
      include: {
        quotation: {
          include: {
            customer: true,
            lines: {
              include: {
                product: true,
              },
            },
            counterOffers: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!portalTokenRecord) {
      throw new AppError('NOT_FOUND', 'Invalid portal access token', 404);
    }

    if (portalTokenRecord.isRevoked) {
      throw new AppError('UNAUTHORIZED', 'Portal access token has been revoked', 401);
    }

    if (new Date() > portalTokenRecord.expiresAt) {
      throw new AppError('UNAUTHORIZED', 'Portal access token has expired', 401);
    }

    return portalTokenRecord;

  }

  async getQuoteByPortalToken(token: string): Promise<SanitizedPortalQuote> {
    const record = await this.validateAndGetPortalToken(token);
    const q = record.quotation;

    return {
      id: q.id,
      quoteNumber: q.quoteNumber,
      status: q.status,
      subtotal: q.subtotal,
      totalDiscount: q.totalDiscount,
      netValue: q.netValue,
      customer: {
        id: q.customer.id,
        name: q.customer.name,
        code: q.customer.code,
        tier: q.customer.tier,
      },
      lines: q.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        quantity: l.quantity,
        listPrice: l.listPrice,
        proposedDiscountPercent: l.proposedDiscountPercent,
        discountAmount: l.discountAmount,
        netLinePrice: l.netLinePrice,
        product: {
          id: l.product.id,
          name: l.product.name,
          sku: l.product.sku,
          category: l.product.category,
          billingType: l.product.billingType,
        },
      })),
      counterOffers: q.counterOffers.map((co) => ({
        id: co.id,
        proposedDiscountPercent: co.proposedDiscountPercent,
        customerNotes: co.customerNotes,
        status: co.status,
        createdAt: co.createdAt,
      })),
    };
  }

  async submitCounterOffer(
    token: string,
    input: SubmitCounterOfferInput,
  ): Promise<{ quote: SanitizedPortalQuote; message: string }> {
    const record = await this.validateAndGetPortalToken(token);
    const quotation = record.quotation;

    // Apply counteroffer line updates or overall discount
    let avgProposedDiscount = input.proposedDiscountPercent || 0;

    if (input.lineDiscounts && input.lineDiscounts.length > 0) {
      let sumDiscount = 0;
      for (const ld of input.lineDiscounts) {
        const line = quotation.lines.find((l) => l.id === ld.lineId);
        if (line) {
          const qty = ld.quantity || line.quantity;
          const discPct = ld.proposedDiscountPercent;
          sumDiscount += discPct;

          const calc = calculateLinePricing({
            listPrice: line.listPrice,
            standardCost: line.product.standardCost,
            quantity: qty,
            proposedDiscountPercent: discPct,
          });

          await db.quoteLine.update({
            where: { id: line.id },
            data: {
              quantity: calc.quantity,
              proposedDiscountPercent: calc.proposedDiscountPercent,
              discountAmount: calc.discountAmount,
              netLinePrice: calc.netLinePrice,
              lineCost: calc.lineCost,
              lineMarginPercent: calc.lineMarginPercent,
            },
          });
        }
      }
      avgProposedDiscount = sumDiscount / input.lineDiscounts.length;
    } else if (input.proposedDiscountPercent !== undefined) {
      for (const line of quotation.lines) {
        const calc = calculateLinePricing({
          listPrice: line.listPrice,
          standardCost: line.product.standardCost,
          quantity: line.quantity,
          proposedDiscountPercent: input.proposedDiscountPercent,
        });

        await db.quoteLine.update({
          where: { id: line.id },
          data: {
            proposedDiscountPercent: calc.proposedDiscountPercent,
            discountAmount: calc.discountAmount,
            netLinePrice: calc.netLinePrice,
            lineCost: calc.lineCost,
            lineMarginPercent: calc.lineMarginPercent,
          },
        });
      }
    }

    // Persist counteroffer record
    const counterOfferRecord = await db.counterOffer.create({
      data: {
        quotationId: quotation.id,
        proposedDiscountPercent: avgProposedDiscount,
        customerNotes: input.customerNotes || null,
        status: 'SUBMITTED',
      },
    });

    // Fresh recalculation of quote aggregate totals & commercial risk
    const updatedLines = await db.quoteLine.findMany({
      where: { quotationId: quotation.id },
      include: { product: true },
    });

    const linesCalc = updatedLines.map((l) =>
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

    const newStatus =
      transition.targetStatus === 'APPROVED' ? 'NEGOTIATING' : transition.targetStatus;

    await db.quotation.update({
      where: { id: quotation.id },
      data: {
        status: newStatus,
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        netValue: totals.netValue,
        grossMarginPercent: totals.grossMarginPercent,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
      },
    });

    await recordAuditEvent({
      eventType: 'COUNTEROFFER_SUBMITTED',
      action: `Customer (${quotation.customer?.name || 'Customer'}) submitted counteroffer on quotation ${quotation.quoteNumber}`,
      entityType: 'CounterOffer',
      entityId: counterOfferRecord.id,
      actor: { id: quotation.customerId, name: quotation.customer?.name || 'Customer', role: 'CUSTOMER' },
      newState: counterOfferRecord,
    });

    const updatedQuote = await this.getQuoteByPortalToken(token);

    return {
      quote: updatedQuote,
      message: `Counteroffer submitted successfully. Quotation status updated to ${newStatus}.`,
    };
  }
}

export const portalService = new PortalService();
