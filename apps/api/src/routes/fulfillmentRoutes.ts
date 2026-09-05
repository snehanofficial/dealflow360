import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  computeFulfillment,
  overrideFulfillment,
  getFulfillmentPlan,
  listWarehouses,
} from '../modules/fulfillment/fulfillmentController.js';

export const fulfillmentRoutes: Router = Router();

fulfillmentRoutes.use(authenticate);

// Mounted at /api/v1/fulfillment
fulfillmentRoutes.get('/warehouses', listWarehouses);

// Mounted at /api/v1/quotes (e.g. GET /api/v1/quotes/:id/fulfillment)
fulfillmentRoutes.get('/:id/fulfillment', getFulfillmentPlan);
fulfillmentRoutes.post('/:id/fulfillment/compute', computeFulfillment);
fulfillmentRoutes.post('/:id/fulfillment/override', overrideFulfillment);

// Support alternate paths (e.g. GET /api/v1/fulfillment/quotes/:id/fulfillment)
fulfillmentRoutes.get('/quotes/:id/fulfillment', getFulfillmentPlan);
fulfillmentRoutes.post('/quotes/:id/fulfillment/compute', computeFulfillment);
fulfillmentRoutes.post('/quotes/:id/fulfillment/override', overrideFulfillment);
