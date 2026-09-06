import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { billingController } from '../modules/billing/billingController.js';

export const billingRoutes: Router = Router();

billingRoutes.use(authenticate);

// Quote-nested endpoints (e.g. GET /api/v1/quotes/:id/billing)
billingRoutes.get('/:id/billing', (req, res, next) => billingController.getBillingSchedule(req, res, next));
billingRoutes.post('/:id/billing/generate', (req, res, next) => billingController.generateBillingSchedule(req, res, next));
billingRoutes.post('/:id/billing/complete', (req, res, next) => billingController.completeBilling(req, res, next));
billingRoutes.post('/:id/complete', (req, res, next) => billingController.completeBilling(req, res, next));

// Standalone billing namespace endpoints (e.g. GET /api/v1/billing/quotes/:id)
billingRoutes.get('/quotes/:id', (req, res, next) => billingController.getBillingSchedule(req, res, next));
billingRoutes.post('/quotes/:id/generate', (req, res, next) => billingController.generateBillingSchedule(req, res, next));
billingRoutes.post('/quotes/:id/complete', (req, res, next) => billingController.completeBilling(req, res, next));
