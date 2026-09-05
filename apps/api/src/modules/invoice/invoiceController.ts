import { Request, Response, NextFunction } from 'express';
import { CreateInvoiceSchema, InvoiceQuerySchema } from '@dealflow360/contracts';
import { invoiceService } from './invoiceService.js';

export class InvoiceController {
  async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const queryFilter = InvoiceQuerySchema.parse(req.query);

      // If actor is a CUSTOMER, force customerId filter to own customer identity
      if (req.user?.role === 'CUSTOMER' && (req.user as any).customerId) {
        queryFilter.customerId = (req.user as any).customerId;
      }

      const result = await invoiceService.listInvoices(queryFilter);

      return res.status(200).json({
        success: true,
        data: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const customerIdContext = req.user?.role === 'CUSTOMER' ? (req.user as any).customerId : undefined;

      const invoice = await invoiceService.getInvoiceById(id, customerIdContext);

      return res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getInvoiceByQuotationId(req: Request, res: Response, next: NextFunction) {
    try {
      const quotationId = Array.isArray(req.params.quotationId) ? req.params.quotationId[0] : req.params.quotationId;
      const invoice = await invoiceService.getInvoiceByQuotationId(quotationId);

      return res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = CreateInvoiceSchema.parse(req.body);
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : null;

      const invoice = await invoiceService.createInvoiceFromQuotation(validatedInput, actor);

      return res.status(201).json({
        success: true,
        message: `Invoice ${invoice.invoiceNumber} created successfully`,
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }

  async issueInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : null;

      const invoice = await invoiceService.issueInvoice(id, actor);

      return res.status(200).json({
        success: true,
        message: `Invoice ${invoice.invoiceNumber} issued successfully`,
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }

  async markInvoicePaid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : null;

      const invoice = await invoiceService.markInvoicePaid(id, actor);

      return res.status(200).json({
        success: true,
        message: `Invoice ${invoice.invoiceNumber} marked as PAID`,
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }

  async voidInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason } = req.body || {};
      const actor = req.user
        ? { id: req.user.userId, name: req.user.email, role: req.user.role }
        : null;

      const invoice = await invoiceService.voidInvoice(id, reason, actor);

      return res.status(200).json({
        success: true,
        message: `Invoice ${invoice.invoiceNumber} voided successfully`,
        data: invoice,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
