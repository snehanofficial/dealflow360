import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import { billingController } from '../modules/billing/billingController.js';

export const billingRoutes: Router = Router();

billingRoutes.use(authenticate);

// Quote-nested endpoints (e.g. GET /api/v1/quotes/:id/billing)
billingRoutes.get('/:id/billing', requirePermission(Permissions.BILLING_VIEW), (req, res, next) => billingController.getBillingSchedule(req, res, next));
billingRoutes.post('/:id/billing/generate', requirePermission(Permissions.BILLING_MANAGE), (req, res, next) => billingController.generateBillingSchedule(req, res, next));
billingRoutes.post('/:id/billing/complete', requirePermission(Permissions.BILLING_MANAGE), (req, res, next) => billingController.completeBilling(req, res, next));
billingRoutes.post('/:id/complete', requirePermission(Permissions.BILLING_MANAGE), (req, res, next) => billingController.completeBilling(req, res, next));

// Standalone billing namespace endpoints (e.g. GET /api/v1/billing/quotes/:id)
billingRoutes.get('/quotes/:id', requirePermission(Permissions.BILLING_VIEW), (req, res, next) => billingController.getBillingSchedule(req, res, next));
billingRoutes.post('/quotes/:id/generate', requirePermission(Permissions.BILLING_MANAGE), (req, res, next) => billingController.generateBillingSchedule(req, res, next));
billingRoutes.post('/quotes/:id/complete', requirePermission(Permissions.BILLING_MANAGE), (req, res, next) => billingController.completeBilling(req, res, next));

