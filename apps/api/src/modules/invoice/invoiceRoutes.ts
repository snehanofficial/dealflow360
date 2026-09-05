import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { invoiceController } from './invoiceController.js';

export const invoiceRoutes: Router = Router();

invoiceRoutes.use(authenticate);

invoiceRoutes.get('/', (req, res, next) => invoiceController.listInvoices(req, res, next));
invoiceRoutes.get('/quotation/:quotationId', (req, res, next) =>
  invoiceController.getInvoiceByQuotationId(req, res, next),
);
invoiceRoutes.get('/:id', (req, res, next) => invoiceController.getInvoiceById(req, res, next));
invoiceRoutes.post('/', (req, res, next) => invoiceController.createInvoice(req, res, next));
invoiceRoutes.post('/:id/issue', (req, res, next) => invoiceController.issueInvoice(req, res, next));
invoiceRoutes.post('/:id/pay', (req, res, next) => invoiceController.markInvoicePaid(req, res, next));
invoiceRoutes.post('/:id/void', (req, res, next) => invoiceController.voidInvoice(req, res, next));
