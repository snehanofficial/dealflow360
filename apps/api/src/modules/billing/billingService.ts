import { db, BillingSchedule, BillingLine, TxClient } from '@dealflow360/db';
import {
  calculateHybridBillingSchedule,
  QuoteLineBillingInput,
  HybridBillingScheduleResult,
} from '@dealflow360/domain';
import { AppError } from '../../middleware/errorHandler.js';
import { recordAuditEvent } from '../../services/auditService.js';

export class BillingService {
  async getBillingScheduleForQuote(quotationId: string, startDateInput?: string) {
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        lines: {
          include: { product: true },
        },
        billingSchedule: {
          include: { lines: true },
        },
      },
    });

    if (!quotation) {
      throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
    }

    const startDate = startDateInput ? new Date(startDateInput) : new Date();

    // Map quotation lines for billing calculation
    const linesInput: QuoteLineBillingInput[] = quotation.lines.map((l) => ({
      quoteLineId: l.id,
      productName: l.product?.name || 'Product Item',
      billingType: l.product?.billingType === 'RECURRING' ? 'RECURRING' : 'ONE_TIME',
      recurringPeriod: l.product?.recurringPeriod || null,
      netLinePrice: l.netLinePrice,
      quantity: l.quantity,
    }));

    const computedSchedule = calculateHybridBillingSchedule(linesInput, startDate, 12);

    return {
      quotation,
      persistedSchedule: quotation.billingSchedule,
      computedSchedule,
    };
  }

  async generateAndSaveBillingSchedule(
    quotationId: string,
    startDateInput?: string,
    actor?: { id?: string; name?: string; role?: string } | null,
    txClient?: TxClient
  ) {
    const run = async (tx: TxClient) => {
      const quotation = await tx.quotation.findUnique({
        where: { id: quotationId },
        include: {
          lines: {
            include: { product: true },
          },
          billingSchedule: true,
        },
      });

      if (!quotation) {
        throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
      }

      if (!['FULFILLMENT', 'BILLING', 'APPROVED'].includes(quotation.status)) {
        throw new AppError(
          'BAD_REQUEST',
          `Cannot generate billing schedule for quotation ${quotation.quoteNumber} in state ${quotation.status}. Quotation must be in FULFILLMENT stage first.`,
          400,
        );
      }

      const startDate = startDateInput ? new Date(startDateInput) : new Date();

      const linesInput: QuoteLineBillingInput[] = quotation.lines.map((l) => ({
        quoteLineId: l.id,
        productName: l.product?.name || 'Product Item',
        billingType: l.product?.billingType === 'RECURRING' ? 'RECURRING' : 'ONE_TIME',
        recurringPeriod: l.product?.recurringPeriod || null,
        netLinePrice: l.netLinePrice,
        quantity: l.quantity,
      }));

      const computed = calculateHybridBillingSchedule(linesInput, startDate, 12);

      if (quotation.billingSchedule) {
        await tx.billingSchedule.delete({
          where: { id: quotation.billingSchedule.id },
        });
      }

      const savedSchedule = await tx.billingSchedule.create({
        data: {
          quotationId,
          totalOneTimeAmount: computed.totalOneTimeAmount,
          totalRecurringMonthly: computed.totalRecurringMonthly,
          totalRecurringAnnual: computed.totalRecurringAnnual,
          billingStartDate: computed.billingStartDate,
          status: 'ACTIVE',
          lines: {
            create: computed.lines.map((line) => ({
              quoteLineId: line.quoteLineId,
              productName: line.productName,
              billingType: line.billingType,
              recurringPeriod: line.recurringPeriod,
              billingDate: line.billingDate,
              amount: line.amount,
              proratedDays: line.proratedDays,
              isProrated: line.isProrated,
              status: line.status,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'BILLING' },
      });

      await recordAuditEvent({
        eventType: 'BILLING_SCHEDULE_GENERATED',
        action: `Generated and locked hybrid billing schedule for quotation ${quotation.quoteNumber}`,
        entityType: 'BillingSchedule',
        entityId: savedSchedule.id,
        actor,
        newState: savedSchedule as any,
      }, tx as any);

      return {
        message: 'Hybrid billing schedule generated and locked successfully.',
        billingSchedule: savedSchedule,
      };
    };

    return txClient ? run(txClient) : db.$transaction(run);
  }

  async completeBillingAndMarkQuoteCompleted(
    quotationId: string,
    actor?: { id?: string; name?: string; role?: string } | null,
    txClient?: TxClient
  ) {
    const run = async (tx: TxClient) => {
      const quotation = await tx.quotation.findUnique({
        where: { id: quotationId },
        include: { billingSchedule: { include: { lines: true } } },
      });

      if (!quotation) {
        throw new AppError('NOT_FOUND', `Quotation ${quotationId} not found`, 404);
      }

      if (quotation.status !== 'BILLING') {
        throw new AppError(
          'BAD_REQUEST',
          `Quotation ${quotation.quoteNumber} is in status ${quotation.status} and cannot be completed. It must be in BILLING stage first.`,
          400,
        );
      }

      if (!quotation.billingSchedule) {
        throw new AppError(
          'BAD_REQUEST',
          `Quotation ${quotation.quoteNumber} does not have a locked billing schedule generated yet. Generate a billing schedule before completing billing.`,
          400,
        );
      }

      await tx.billingLine.updateMany({
        where: { billingScheduleId: quotation.billingSchedule.id },
        data: { status: 'BILLED' },
      });

      await tx.billingSchedule.update({
        where: { id: quotation.billingSchedule.id },
        data: { status: 'COMPLETED' },
      });

      const updatedQuotation = await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'COMPLETED' },
        include: {
          customer: true,
          lines: { include: { product: true } },
          billingSchedule: true,
        },
      });

      await recordAuditEvent({
        eventType: 'ORDER_COMPLETED',
        action: `Completed billing and marked quotation ${quotation.quoteNumber} as COMPLETED`,
        entityType: 'Quotation',
        entityId: quotationId,
        actor,
        newState: { status: 'COMPLETED' },
      }, tx as any);

      return {
        message: 'Billing completed and quotation status updated to COMPLETED.',
        quotation: updatedQuotation,
      };
    };

    return txClient ? run(txClient) : db.$transaction(run);
  }
}

export const billingService = new BillingService();
