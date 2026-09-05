import { Router } from 'express';
import {
  createProductHandler,
  getProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  getCategoriesHandler,
  getPriceListsHandler,
  createPriceListHandler,
} from '../controllers/productController.js';
import { authenticate, requirePermission, requireRole } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';

export const productRoutes: Router = Router();

productRoutes.use(authenticate);

productRoutes.get(
  '/categories',
  requirePermission(Permissions.PRODUCT_VIEW),
  getCategoriesHandler,
);

productRoutes.get(
  '/price-lists',
  requirePermission(Permissions.PRODUCT_VIEW),
  getPriceListsHandler,
);

productRoutes.post(
  '/price-lists',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createPriceListHandler,
);

productRoutes.get(
  '/',
  requirePermission(Permissions.PRODUCT_VIEW),
  getProductsHandler,
);

productRoutes.post(
  '/',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createProductHandler,
);

productRoutes.get(
  '/:id',
  requirePermission(Permissions.PRODUCT_VIEW),
  getProductByIdHandler,
);

productRoutes.patch(
  '/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  updateProductHandler,
);
