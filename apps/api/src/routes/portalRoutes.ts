import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getPortalQuote,
  submitCounterOffer,
  generatePortalToken,
} from '../modules/portal/portalController.js';

export const portalRoutes: Router = Router();

// Public customer portal endpoints
portalRoutes.get('/quotes/:token', getPortalQuote);
portalRoutes.post('/quotes/:token/counter-offer', submitCounterOffer);

// Authenticated endpoint to issue portal tokens
portalRoutes.post('/tokens', authenticate, generatePortalToken);
