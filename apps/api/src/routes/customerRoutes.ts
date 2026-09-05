import { Router } from 'express';
import {
  createCustomerHandler,
  getCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
} from '../controllers/customerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const customerRoutes: Router = Router();

customerRoutes.use(authenticate);

customerRoutes.get(
  '/',
  requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS']),
  getCustomersHandler,
);

customerRoutes.post(
  '/',
  requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']),
  createCustomerHandler,
);

customerRoutes.get(
  '/:id',
  requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS']),
  getCustomerByIdHandler,
);

customerRoutes.patch(
  '/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  updateCustomerHandler,
);
