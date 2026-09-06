import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { Permissions } from '@dealflow360/contracts';
import {
  createQuotation,
  listQuotations,
  getQuotation,
  addQuoteLine,
  updateQuoteLine,
  deleteQuoteLine,
  submitQuotation,
} from '../modules/quotes/quoteController.js';
import { getRecommendations } from '../modules/recommendations/recommendationController.js';

export const quoteRoutes: Router = Router();

quoteRoutes.use(authenticate);

quoteRoutes.post('/', requirePermission(Permissions.QUOTATION_CREATE), createQuotation);
quoteRoutes.get('/', requirePermission(Permissions.QUOTATION_VIEW), listQuotations);
quoteRoutes.get('/:id', requirePermission(Permissions.QUOTATION_VIEW), getQuotation);
quoteRoutes.post('/:id/lines', requirePermission(Permissions.QUOTATION_UPDATE), addQuoteLine);
quoteRoutes.patch('/:id/lines/:lineId', requirePermission(Permissions.QUOTATION_UPDATE), updateQuoteLine);
quoteRoutes.delete('/:id/lines/:lineId', requirePermission(Permissions.QUOTATION_UPDATE), deleteQuoteLine);
quoteRoutes.post('/:id/submit', requirePermission(Permissions.QUOTATION_SUBMIT), submitQuotation);
quoteRoutes.get('/:quotationId/recommendations', requirePermission(Permissions.QUOTATION_VIEW), getRecommendations);

