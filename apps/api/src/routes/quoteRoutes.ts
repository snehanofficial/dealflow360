import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getQuotation, addQuoteLine } from '../modules/quotes/quoteController.js';
import { getRecommendations } from '../modules/recommendations/recommendationController.js';

export const quoteRoutes: Router = Router();

quoteRoutes.use(authenticate);

quoteRoutes.get('/:id', getQuotation);
quoteRoutes.post('/:id/lines', addQuoteLine);
quoteRoutes.get('/:quotationId/recommendations', getRecommendations);
