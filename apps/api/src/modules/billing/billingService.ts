import { db, BillingSchedule, BillingLine } from '@dealflow360/db';
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
  ) {
    const quotation = await db.quotation.findUnique({
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

    // Delete existing billing schedule if present
    if (quotation.billingSchedule) {
      await db.billingSchedule.delete({
        where: { id: quotation.billingSchedule.id },
      });
    }

    // Persist new billing schedule and child lines
    const savedSchedule = await db.billingSchedule.create({
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

    // Update quote status to BILLING
    await db.quotation.update({
      where: { id: quotationId },
      data: { status: 'BILLING' },
    });

    await recordAuditEvent({
      eventType: 'BILLING_SCHEDULE_GENERATED',
      action: `Generated and locked hybrid billing schedule for quotation ${quotation.quoteNumber}`,
      entityType: 'BillingSchedule',
      entityId: savedSchedule.id,
      actor,
      newState: savedSchedule,
    });

    return {
      message: 'Hybrid billing schedule generated and locked successfully.',
      billingSchedule: savedSchedule,
    };
  }
}

export const billingService = new BillingService();
