import { Router } from 'express';
import {
  createProductHandler,
  getProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  getCategoriesHandler,
  getCategoryByIdHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  upsertCategoryDiscountPolicyHandler,
  getPriceListsHandler,
  getPriceListByIdHandler,
  createPriceListHandler,
  updatePriceListHandler,
  deletePriceListHandler,
  upsertPriceListEntryHandler,
  deletePriceListEntryHandler,
  getAttributesHandler,
  createAttributeHandler,
  addAttributeValueHandler,
  deleteAttributeValueHandler,
  createVariantHandler,
  updateVariantHandler,
  deleteVariantHandler,
} from '../controllers/productController.js';
import { authenticate, requirePermission, requireRole } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';

export const productRoutes: Router = Router();

productRoutes.use(authenticate);

// Categories
productRoutes.get(
  '/categories',
  requirePermission(Permissions.PRODUCT_VIEW),
  getCategoriesHandler,
);

productRoutes.get(
  '/categories/:id',
  requirePermission(Permissions.PRODUCT_VIEW),
  getCategoryByIdHandler,
);

productRoutes.post(
  '/categories',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createCategoryHandler,
);

productRoutes.patch(
  '/categories/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  updateCategoryHandler,
);

productRoutes.delete(
  '/categories/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deleteCategoryHandler,
);

productRoutes.post(
  '/categories/:id/discount-policy',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  upsertCategoryDiscountPolicyHandler,
);

// Attributes & Attribute Values
productRoutes.get(
  '/attributes',
  requirePermission(Permissions.PRODUCT_VIEW),
  getAttributesHandler,
);

productRoutes.post(
  '/attributes',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createAttributeHandler,
);

productRoutes.post(
  '/attributes/:id/values',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  addAttributeValueHandler,
);

productRoutes.delete(
  '/attributes/values/:valueId',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deleteAttributeValueHandler,
);

// Price Lists
productRoutes.get(
  '/price-lists',
  requirePermission(Permissions.PRODUCT_VIEW),
  getPriceListsHandler,
);

productRoutes.get(
  '/price-lists/:id',
  requirePermission(Permissions.PRODUCT_VIEW),
  getPriceListByIdHandler,
);

productRoutes.post(
  '/price-lists',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createPriceListHandler,
);

productRoutes.patch(
  '/price-lists/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  updatePriceListHandler,
);

productRoutes.delete(
  '/price-lists/:id',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deletePriceListHandler,
);

productRoutes.post(
  '/price-lists/:id/entries',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  upsertPriceListEntryHandler,
);

productRoutes.delete(
  '/price-lists/:id/entries/:productId',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deletePriceListEntryHandler,
);


// Products
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

// Variants
productRoutes.post(
  '/:productId/variants',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  createVariantHandler,
);

productRoutes.patch(
  '/:productId/variants/:variantId',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  updateVariantHandler,
);

productRoutes.delete(
  '/:productId/variants/:variantId',
  requireRole(['ADMIN', 'SALES_MANAGER']),
  deleteVariantHandler,
);
