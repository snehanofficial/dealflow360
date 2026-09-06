import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
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
fulfillmentRoutes.get('/warehouses', requirePermission(Permissions.WAREHOUSE_VIEW), listWarehouses);
fulfillmentRoutes.get('/quotes/:id/fulfillment', requirePermission(Permissions.FULFILLMENT_VIEW), getFulfillmentPlan);
fulfillmentRoutes.post('/quotes/:id/fulfillment/compute', requirePermission(Permissions.FULFILLMENT_VIEW), computeFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/confirm', requirePermission(Permissions.FULFILLMENT_MANAGE), confirmFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/override', requirePermission(Permissions.FULFILLMENT_MANAGE), overrideFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/ship-all', requirePermission(Permissions.FULFILLMENT_MANAGE), shipAllAndAdvanceToBilling);
fulfillmentRoutes.post('/allocations/:allocationId/ship', requirePermission(Permissions.FULFILLMENT_MANAGE), shipAllocation);

// Backorders endpoints
fulfillmentRoutes.get('/backorders', requirePermission(Permissions.FULFILLMENT_VIEW), listBackorders);
fulfillmentRoutes.get('/backorders/:id/propose', requirePermission(Permissions.FULFILLMENT_VIEW), proposeBackorderReallocation);
fulfillmentRoutes.post('/backorders/:id/reallocate', requirePermission(Permissions.FULFILLMENT_MANAGE), confirmBackorderReallocation);

// Support legacy quote path prefixing (e.g. GET /api/v1/fulfillment/:id/fulfillment)
fulfillmentRoutes.get('/:id/fulfillment', requirePermission(Permissions.FULFILLMENT_VIEW), getFulfillmentPlan);
fulfillmentRoutes.post('/:id/fulfillment/compute', requirePermission(Permissions.FULFILLMENT_VIEW), computeFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/confirm', requirePermission(Permissions.FULFILLMENT_MANAGE), confirmFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/override', requirePermission(Permissions.FULFILLMENT_MANAGE), overrideFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/ship-all', requirePermission(Permissions.FULFILLMENT_MANAGE), shipAllAndAdvanceToBilling);

