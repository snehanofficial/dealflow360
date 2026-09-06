import { db, InvoiceStatus, TxClient } from '@dealflow360/db';
import {
  calculateInvoiceSnapshot,
  generateInvoiceNumber,
  isInvoiceStatusTransitionValid,
  InvoiceLineCalculationInput,
} from '@dealflow360/domain';
import { AppError } from '../../middleware/errorHandler.js';
import { recordAuditEvent } from '../../services/auditService.js';

export interface CreateInvoiceServiceInput {
  quotationId: string;
  dueDate?: string;
  notes?: string;
  status?: InvoiceStatus;
}

export interface InvoiceQueryFilter {
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class InvoiceService {
  async listInvoices(filter: InvoiceQueryFilter) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (filter.status) {
      whereClause.status = filter.status;
    }

    if (filter.customerId) {
      whereClause.customerId = filter.customerId;
    }

    if (filter.search) {
      const searchStr = filter.search.trim();
      whereClause.OR = [
        { invoiceNumber: { contains: searchStr, mode: 'insensitive' } },
        { customerName: { contains: searchStr, mode: 'insensitive' } },
        { customerEmail: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      db.invoice.findMany({
        where: whereClause,
        include: {
          customer: {
            select: { id: true, name: true, code: true, tier: true },
          },
          quotation: {
            select: { id: true, quoteNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.invoice.count({ where: whereClause }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getInvoiceById(id: string, actorCustomerContextId?: string) {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, category: true, listPrice: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError('NOT_FOUND', `Invoice ${id} not found`, 404);
    }

    if (actorCustomerContextId && invoice.customerId !== actorCustomerContextId) {
      throw new AppError('NOT_FOUND', `Invoice ${id} not found`, 404);
    }

    return invoice;
  }

  async getInvoiceByQuotationId(quotationId: string) {
    return db.invoice.findUnique({
      where: { quotationId },
      include: {
        customer: true,
        lines: true,
      },
    });
  }

  async createInvoiceFromQuotation(
    input: CreateInvoiceServiceInput,
    actor?: { id?: string; name?: string; role?: string } | null,
    txClient?: TxClient
  ) {
    const run = async (tx: TxClient) => {
      const quotation = await tx.quotation.findUnique({
        where: { id: input.quotationId },
        include: {
          customer: true,
          lines: {
            include: { product: true },
          },
        },
      });

      if (!quotation) {
        throw new AppError('NOT_FOUND', `Quotation ${input.quotationId} not found`, 404);
      }

      const eligibleStatuses = ['APPROVED', 'FULFILLMENT', 'BILLING', 'COMPLETED'];
      if (!eligibleStatuses.includes(quotation.status)) {
        throw new AppError(
          'INVALID_STATE',
          `Quotation ${quotation.quoteNumber} (status: ${quotation.status}) is not eligible for invoicing. It must be approved first.`,
          400,
        );
      }

      const existingInvoice = await tx.invoice.findUnique({
        where: { quotationId: input.quotationId },
      });

      if (existingInvoice) {
        throw new AppError(
          'DUPLICATE_RESOURCE',
          `An invoice (${existingInvoice.invoiceNumber}) already exists for quotation ${quotation.quoteNumber}.`,
          400,
        );
      }

      const lineInputs: InvoiceLineCalculationInput[] = quotation.lines.map((l) => ({
        productId: l.productId,
        productName: l.product?.name || 'Product Line Item',
        productSku: l.product?.sku || 'SKU-000',
        quantity: l.quantity,
        listPrice: l.listPrice,
        unitPrice: l.unitPrice || l.listPrice,
        proposedDiscountPercent: l.proposedDiscountPercent,
        taxRate: l.taxRate || 0,
      }));

      const snapshot = calculateInvoiceSnapshot(lineInputs);

      const count = await tx.invoice.count();
      const invoiceNumber = generateInvoiceNumber(count + 1);

      const issueDate = new Date();
      const defaultDueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      const dueDate = input.dueDate ? new Date(input.dueDate) : defaultDueDate;
      const initialStatus = input.status || 'ISSUED';

      const savedInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          customerName: quotation.customer.name,
          customerEmail: quotation.customer.email,
          customerPhone: quotation.customer.phone || null,
          customerTier: quotation.customer.tier,
          customerRegion: quotation.customer.region,
          status: initialStatus,
          issueDate,
          dueDate,
          subtotal: snapshot.subtotal,
          totalDiscount: snapshot.totalDiscount,
          taxableAmount: snapshot.taxableAmount,
          taxAmount: snapshot.taxAmount,
          totalAmount: snapshot.totalAmount,
          notes: input.notes || null,
          createdById: actor?.id || quotation.createdById,
          lines: {
            create: snapshot.lines.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              productSku: line.productSku,
              quantity: line.quantity,
              listPrice: line.listPrice,
              unitPrice: line.unitPrice,
              proposedDiscountPercent: line.proposedDiscountPercent,
              discountAmount: line.discountAmount,
              taxRate: line.taxRate,
              taxAmount: line.taxAmount,
              taxableAmount: line.taxableAmount,
              lineTotal: line.lineTotal,
            })),
          },
        },
        include: {
          customer: true,
          quotation: true,
          lines: true,
        },
      });

      if (quotation.status === 'APPROVED' || quotation.status === 'FULFILLMENT') {
        await tx.quotation.update({
          where: { id: quotation.id },
          data: { status: 'BILLING' },
        });
      }

      await recordAuditEvent({
        eventType: initialStatus === 'ISSUED' ? 'INVOICE_ISSUED' : 'INVOICE_CREATED',
        action: `Created invoice ${savedInvoice.invoiceNumber} for quotation ${quotation.quoteNumber} with net total ${savedInvoice.totalAmount}`,
        entityType: 'Invoice',
        entityId: savedInvoice.id,
        actor,
        newState: savedInvoice as any,
      }, tx as any);

      return savedInvoice;
    };

    return txClient ? run(txClient) : db.$transaction(run);
  }

  async issueInvoice(id: string, actor?: { id?: string; name?: string; role?: string } | null) {
    const invoice = await db.invoice.findUnique({ where: { id } });

    if (!invoice) {
      throw new AppError('NOT_FOUND', `Invoice ${id} not found`, 404);
    }

    if (!isInvoiceStatusTransitionValid(invoice.status as any, 'ISSUED')) {
      throw new AppError('INVALID_STATE', `Cannot transition invoice from ${invoice.status} to ISSUED`, 400);
    }

    const updated = await db.invoice.update({
      where: { id },
      data: {
        status: 'ISSUED',
        issueDate: new Date(),
      },
      include: {
        customer: true,
        lines: true,
      },
    });

    await recordAuditEvent({
      eventType: 'INVOICE_ISSUED',
      action: `Issued invoice ${updated.invoiceNumber} to ${updated.customerName}`,
      entityType: 'Invoice',
      entityId: updated.id,
      actor,
      previousState: invoice,
      newState: updated,
    });

    return updated;
  }

  async markInvoicePaid(id: string, actor?: { id?: string; name?: string; role?: string } | null, txClient?: TxClient) {
    const run = async (tx: TxClient) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });

      if (!invoice) {
        throw new AppError('NOT_FOUND', `Invoice ${id} not found`, 404);
      }

      if (invoice.status === 'VOID') {
        throw new AppError('INVALID_STATE', 'Cannot mark a voided invoice as paid', 400);
      }

      const updated = await tx.invoice.update({
        where: { id },
        data: { status: 'PAID' },
      });

      await tx.quotation.update({
        where: { id: invoice.quotationId },
        data: { status: 'COMPLETED' },
      });

      await recordAuditEvent({
        eventType: 'INVOICE_PAID',
        action: `Marked invoice ${updated!.invoiceNumber} as PAID (${updated!.totalAmount})`,
        entityType: 'Invoice',
        entityId: updated!.id,
        actor,
        previousState: invoice as any,
        newState: updated as any,
      }, tx as any);

      return updated;
    };

    return txClient ? run(txClient) : db.$transaction(run);
  }

  async recordPayment(
    id: string,
    amount: number,
    method: string,
    reference?: string,
    actor?: { id?: string; name?: string; role?: string } | null,
    txClient?: TxClient
  ) {
    const run = async (tx: TxClient) => {
      const invoice = (await tx.invoice.findUnique({ 
        where: { id },
        include: { payments: true, quotation: true }
      })) as any;

      if (!invoice) {
        throw new AppError('NOT_FOUND', `Invoice ${id} not found`, 404);
      }

      if (invoice.status === 'VOID' || invoice.status === 'PAID') {
        throw new AppError('INVALID_STATE', `Cannot record payment for invoice in ${invoice.status} status`, 400);
      }

      const payment = await (tx as any).payment.create({
        data: {
          invoiceId: id,
          amount,
          method,
          reference: reference || null,
          recordedById: actor?.id || invoice.createdById || "system",
        }
      });

      // Calculate total paid so far
      const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0) + amount;
      
      let newStatus: any = invoice.status;
      if (totalPaid >= Number(invoice.totalAmount)) {
        newStatus = 'PAID';
      }

      if (newStatus !== invoice.status) {
        await tx.invoice.update({
          where: { id },
          data: { status: newStatus }
        });
        
        if (newStatus === 'PAID' && invoice.quotation) {
          // If the invoice is paid, complete the quote
          await tx.quotation.update({
            where: { id: invoice.quotationId },
            data: { status: 'COMPLETED' },
          });
        }
      }

      await recordAuditEvent({
        eventType: 'PAYMENT_RECORDED',
        action: `Recorded payment of ${amount} for invoice ${invoice.invoiceNumber}. Status is now ${newStatus}.`,
        entityType: 'Invoice',
        entityId: id,
        actor,
        newState: { payment, newStatus } as any,
      }, tx as any);

      return payment;
    };

    return txClient ? run(txClient) : db.$transaction(run);
  }

  async listPayments(invoiceId: string) {
    return (db as any).payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async voidInvoice(
    id: string,
    reason?: string,
    actor?: { id?: string; name?: string; role?: string } | null,
  ) {
    const invoice = await db.invoice.findUnique({ where: { id } });

    if (!invoice) {
      throw new AppError('NOT_FOUND', `Invoice ${id} not found`, 404);
    }

    if (!isInvoiceStatusTransitionValid(invoice.status as any, 'VOID')) {
      throw new AppError('INVALID_STATE', `Cannot transition invoice from ${invoice.status} to VOID`, 400);
    }

    const updated = await db.invoice.update({
      where: { id },
      data: {
        status: 'VOID',
        notes: reason ? `VOIDED: ${reason}` : invoice.notes,
      },
      include: {
        customer: true,
        lines: true,
      },
    });

    await recordAuditEvent({
      eventType: 'INVOICE_VOIDED',
      action: `Voided invoice ${updated.invoiceNumber}${reason ? ` (${reason})` : ''}`,
      entityType: 'Invoice',
      entityId: updated.id,
      actor,
      previousState: invoice,
      newState: updated,
    });

    return updated;
  }
}

export const invoiceService = new InvoiceService();
