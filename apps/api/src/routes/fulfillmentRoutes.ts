import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  computeFulfillment,
  confirmFulfillment,
  shipAllocation,
  shipAllAndAdvanceToBilling,
  overrideFulfillment,
  getFulfillmentPlan,
  listWarehouses,
  listBackorders,
  proposeBackorderReallocation,
  confirmBackorderReallocation,
} from '../modules/fulfillment/fulfillmentController.js';

export const fulfillmentRoutes: Router = Router();

fulfillmentRoutes.use(authenticate);

// Fulfillment Order Allocation & Warehouse Stock endpoints
fulfillmentRoutes.get('/warehouses', listWarehouses);
fulfillmentRoutes.get('/quotes/:id/fulfillment', getFulfillmentPlan);
fulfillmentRoutes.post('/quotes/:id/fulfillment/compute', computeFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/confirm', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), confirmFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/override', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), overrideFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/ship-all', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), shipAllAndAdvanceToBilling);
fulfillmentRoutes.post('/allocations/:allocationId/ship', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), shipAllocation);

// Backorders endpoints
fulfillmentRoutes.get('/backorders', listBackorders);
fulfillmentRoutes.get('/backorders/:id/propose', proposeBackorderReallocation);
fulfillmentRoutes.post('/backorders/:id/reallocate', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER']), confirmBackorderReallocation);

// Support legacy quote path prefixing (e.g. GET /api/v1/fulfillment/:id/fulfillment)
fulfillmentRoutes.get('/:id/fulfillment', getFulfillmentPlan);
fulfillmentRoutes.post('/:id/fulfillment/compute', computeFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/confirm', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), confirmFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/override', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), overrideFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/ship-all', requireRole(['ADMIN', 'FINANCE_OPERATIONS', 'SALES_MANAGER', 'SALES_REP']), shipAllAndAdvanceToBilling);
