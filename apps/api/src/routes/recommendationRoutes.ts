import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getRecommendations } from '../modules/recommendations/recommendationController.js';

export const recommendationRoutes: Router = Router();

recommendationRoutes.use(authenticate);

recommendationRoutes.get('/quotes/:quotationId', getRecommendations);
recommendationRoutes.get('/:quotationId', getRecommendations);
