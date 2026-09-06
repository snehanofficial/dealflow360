import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import { invoiceController } from './invoiceController.js';

export const invoiceRoutes: Router = Router();

invoiceRoutes.use(authenticate);

invoiceRoutes.get('/', requirePermission(Permissions.INVOICE_VIEW), (req, res, next) =>
  invoiceController.listInvoices(req, res, next),
);
invoiceRoutes.get('/export/xlsx', requirePermission(Permissions.INVOICE_VIEW), (req, res, next) =>
  invoiceController.exportInvoicesListXlsx(req, res, next),
);
invoiceRoutes.get(
  '/quotation/:quotationId',
  requirePermission(Permissions.INVOICE_VIEW),
  (req, res, next) => invoiceController.getInvoiceByQuotationId(req, res, next),
);
invoiceRoutes.get('/:id', requirePermission(Permissions.INVOICE_VIEW), (req, res, next) =>
  invoiceController.getInvoiceById(req, res, next),
);
invoiceRoutes.get('/:id/export/pdf', requirePermission(Permissions.INVOICE_VIEW), (req, res, next) =>
  invoiceController.exportInvoicePdf(req, res, next),
);
invoiceRoutes.get('/:id/export/xlsx', requirePermission(Permissions.INVOICE_VIEW), (req, res, next) =>
  invoiceController.exportInvoiceXlsx(req, res, next),
);
invoiceRoutes.get('/:id/payments', requirePermission(Permissions.INVOICE_VIEW), (req, res, next) =>
  invoiceController.listPayments(req, res, next),
);

invoiceRoutes.post('/', requirePermission(Permissions.INVOICE_MANAGE), (req, res, next) =>
  invoiceController.createInvoice(req, res, next),
);
invoiceRoutes.post('/:id/issue', requirePermission(Permissions.INVOICE_MANAGE), (req, res, next) =>
  invoiceController.issueInvoice(req, res, next),
);
invoiceRoutes.post('/:id/pay', requirePermission(Permissions.INVOICE_MANAGE), (req, res, next) =>
  invoiceController.markInvoicePaid(req, res, next),
);
invoiceRoutes.post('/:id/payments', requirePermission(Permissions.PAYMENT_RECORD), (req, res, next) =>
  invoiceController.recordPayment(req, res, next),
);
invoiceRoutes.post('/:id/void', requirePermission(Permissions.INVOICE_MANAGE), (req, res, next) =>
  invoiceController.voidInvoice(req, res, next),
);
