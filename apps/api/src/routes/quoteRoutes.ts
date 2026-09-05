import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
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

quoteRoutes.post('/', createQuotation);
quoteRoutes.get('/', listQuotations);
quoteRoutes.get('/:id', getQuotation);
quoteRoutes.post('/:id/lines', addQuoteLine);
quoteRoutes.patch('/:id/lines/:lineId', updateQuoteLine);
quoteRoutes.delete('/:id/lines/:lineId', deleteQuoteLine);
quoteRoutes.post('/:id/submit', submitQuotation);
quoteRoutes.get('/:quotationId/recommendations', getRecommendations);
