import { Router } from 'express';
import {
  getPriceListsHandler,
  getPriceListByIdHandler,
  createPriceListHandler,
  updatePriceListHandler,
  deletePriceListHandler,
  upsertPriceListEntryHandler,
  deletePriceListEntryHandler,
} from '../controllers/productController.js';
import { authenticate, requirePermission, requireRole } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';

export const priceListRoutes: Router = Router();

priceListRoutes.use(authenticate);

priceListRoutes.get(
  '/',
  requirePermission(Permissions.PRODUCT_VIEW),
  getPriceListsHandler,
);

priceListRoutes.get(
  '/:id',
  requirePermission(Permissions.PRODUCT_VIEW),
  getPriceListByIdHandler,
);

priceListRoutes.post(
  '/',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createPriceListHandler,
);

priceListRoutes.patch(
  '/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  updatePriceListHandler,
);

priceListRoutes.delete(
  '/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deletePriceListHandler,
);

priceListRoutes.post(
  '/:id/entries',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  upsertPriceListEntryHandler,
);

priceListRoutes.delete(
  '/:id/entries/:productId',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deletePriceListEntryHandler,
);
