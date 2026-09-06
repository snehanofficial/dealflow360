import { db, TxClient } from '@dealflow360/db';
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
    txClient?: TxClient
  ): Promise<{ quote: SanitizedPortalQuote; message: string }> {
    const run = async (tx: TxClient) => {
      const record = await tx.portalToken.findUnique({
        where: { token },
        include: {
          quotation: {
            include: {
              customer: true,
              lines: { include: { product: true } },
              counterOffers: { orderBy: { createdAt: 'desc' } },
            },
          },
        },
      });

      if (!record || record.expiresAt < new Date()) {
        throw new AppError('UNAUTHORIZED', 'Invalid or expired portal token', 401);
      }
      
      const quotation = record.quotation;

      if (!['DRAFT', 'NEGOTIATING', 'APPROVED'].includes(quotation.status)) {
        throw new AppError('INVALID_STATE', `Quotation in status ${quotation.status} cannot be negotiated`, 400);
      }

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

            await tx.quoteLine.update({
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

          await tx.quoteLine.update({
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

      const counterOfferRecord = await tx.counterOffer.create({
        data: {
          quotationId: quotation.id,
          proposedDiscountPercent: avgProposedDiscount,
          customerNotes: input.customerNotes || null,
          status: 'SUBMITTED',
        },
      });

      const updatedLines = await tx.quoteLine.findMany({
        where: { quotationId: quotation.id },
        include: { product: true },
      });

      const linesCalc = updatedLines.map((l) =>
        calculateLinePricing({
          listPrice: l.listPrice,
          standardCost: l.product.standardCost,
          quantity: l.quantity,
          proposedDiscountPercent: l.proposedDiscountPercent,
        })
      );

      const totals = calculateQuoteTotals(linesCalc);
      const risk = evaluateQuoteRisk(totals);
      const transition = evaluateSubmitTransition(risk);
      
      const newStatus = transition.targetStatus === 'PENDING_FINANCE' || transition.targetStatus === 'PENDING_MANAGER' 
        ? transition.targetStatus 
        : 'NEGOTIATING';

      await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: newStatus,
          subtotal: totals.subtotal,
          totalDiscount: totals.totalDiscount,
          taxableAmount: totals.taxableAmount,
          taxAmount: totals.taxAmount,
          netValue: totals.netValue,
          grossMarginPercent: totals.grossMarginPercent,
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
        },
      });

      if (quotation.status !== newStatus) {
        await tx.approvalRequest.updateMany({
          where: { quotationId: quotation.id, status: 'PENDING' },
          data: { status: 'SUPERSEDED' },
        });
      }

      const finalQuote = await tx.quotation.findUnique({
        where: { id: quotation.id },
        include: {
          customer: true,
          lines: { include: { product: true } },
          counterOffers: { orderBy: { createdAt: 'desc' } },
        },
      });

      await recordAuditEvent({
        eventType: 'CUSTOMER_COUNTER_OFFER',
        action: `Customer submitted counteroffer for ${quotation.quoteNumber} (Avg Disc: ${avgProposedDiscount}%)`,
        entityType: 'Quotation',
        entityId: quotation.id,
        actor: { id: quotation.customerId, role: 'CUSTOMER', name: quotation.customer.name },
        previousState: quotation as any,
        newState: finalQuote as any,
      }, tx as any);

      const updatedQuote = await this.getQuoteByPortalToken(token);
      return {
        quote: updatedQuote,
        message: 'Counteroffer submitted successfully. Our team will review the new commercial terms.',
      };
    };

    return txClient ? run(txClient) : db.$transaction(run);
  }
}

export const portalService = new PortalService();
